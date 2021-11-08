const express = require("express");
const app = express();
//nykyään cookie ei osa expressiä vaan erillinen https://www.npmjs.com/package/cookie-parser
const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");

const session = require("express-session");
const crypto = require("crypto");

const fileshandler = require("./models/fileshandler");

const portti = 3006;

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(cookieParser('secret-word'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { "extended" : true } ));

app.use(express.static("./public"));

app.use(session({ 
                    "secret" : "SuuriSalaisuus!", 
                    "resave" : false, 
                    "saveUninitialized" : false 
                }));


app.post("/login/", (req, res) => {

    //jos painettu muista minut niin asetetaan tunnin määrä
    //ja cookien max käyttöaika eli 7*24h eli viikko
    if(req.body.remember) {
        var hour = 3600000;
        req.session.cookie.maxAge = 7*24*hour;
    } else {
        req.session.cookie.expires = false;
    }

    //fileshandler tiedostosta käytetään haekäyttäjä funktiota
    //jonka avulla haetaan annettu käyttäjä ja verrataan annettua salasanaa
    //tiedostossa olevan sha512 hash merkkijonoon
    fileshandler.haeKayttaja(req.body.tunnus, (kayttaja) => {

        if (kayttaja) {

            let hash = crypto.createHash("SHA512").update(req.body.salasana).digest("hex");

            //jos oikea niin asetetaan clearance (muuttuja pääsyä varten) todeksi ja
            //sessiolle asetetaan käyttäjän id + tunnus
            if (hash == kayttaja.salasana) {
    
                req.session.clearance = true;
    
                let sessioKayttaja = {
                                        "id": kayttaja.kayttajaId,
                                        "tunnus" : kayttaja.kayttajatunnus
                                    };

                req.session.kayttaja = sessioKayttaja;

                res.redirect("/");
    
            } else {
                //muuten ei päästetä ja annetaan virhe
                req.session.clearance = false;
    
                res.render("login", { "virhe" : "Virheellinen käyttäjätunnus tai salasana" });
    
            }
    
        } else {
    
            req.session.clearance = false;
    
            res.render("login", { "virhe" : "Virheellinen käyttäjätunnus tai salasana" });
    
        }

    });

});

//poistakommentti funktiolla poistetaan kommentin id:tä vastaava kommentti
app.post("/poistakommentti/", (req, res) => {

    fileshandler.poistakommentti(req.body.poista, () => {

    res.redirect("/");
    });
});

//ohjaus rekisteröintiin
app.get("/register/", (req, res) => {
    res.render("register", { "virhe" : "" });
});

app.post("/uusikayttaja/", (req, res) => {

//haetaan käyttäjä
fileshandler.haeKayttaja(req.body.tunnus, (kayttaja) => {

    //jos käyttäjä on jo olemassa niin virhe
    if (kayttaja){
        res.render("register", { "virhe" : "Käyttäjänimi on jo käytössä" });
    }   else {
            //haetaan seuraava mahdollinen id käyttäjää varten
            let id = fileshandler.haeId((id) => {
            //luodaan salattu salasana
            let hash = crypto.createHash("SHA512").update(req.body.salasana).digest("hex");

            let uusiKayttaja = {
                "kayttajaId" : id,
                "kayttajatunnus" : req.body.tunnus,
                "salasana" : hash
            };    

            //viedään uusi käyttäjätunnus tietoineen tiedostoon
            fileshandler.rekisteroi(uusiKayttaja, (kayttaja) => {
                res.render("login", { "virhe" : "" });
            });
        });
    }
    });
});

//kommenttin postaus
app.post("/tallenna/", (req, res) => {
    //haetaan aikaleima
    let aikaleima = new Date().getTime();

    let uusiKommentti = {
                        "kommenttiId" : req.body.kommenttiId,
                        "uutisId" : req.body.uutisId,
                        "kayttajaId" : req.session.kayttaja.id,
                        "kommentti" : req.body.kommentti,
                        "aikaleima" : aikaleima
                    };
    
    //funktiolla lisätään uusi kommentti tiedostoon ja uudelleenohjaus
    fileshandler.lisaaUusi(uusiKommentti, () => {

        res.redirect("/");

    });
});

app.get("/logout/", (req, res) => {

    req.session.clearance = false;

    res.redirect("/");

});

app.get("/", (req, res) => {

    //uutiset muuttuja uutisia varten
    //jattaja muuttuja kommentin jättäjää varten
    //kommentit muuttuja kaikkia kommentteja varten
    let uutiset = fileshandler.haeUutiset((uutiset) => {
        let jattaja = fileshandler.haeKommenttijattaja((jattaja) =>{
            let kommentit = fileshandler.haeKommentit((kommentit) => {
                res.render("index", { "uutiset" : uutiset, "kayttaja" : req.session.kayttaja, "clearance" : req.session.clearance, "kommentit" : kommentit, "jattaja" : jattaja });
            })
        })
    });
});

app.listen(portti, () => {

    console.log(`Palvelin käynnistyi porttiin: ${portti}`);

});