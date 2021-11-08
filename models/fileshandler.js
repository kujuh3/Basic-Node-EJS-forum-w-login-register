const fs = require("fs");
const kommentit = "./models/kommentit.json";
const uutiset = "./models/uutiset.json";
const tiedostoKayttajat = "./models/kayttajat.json";

module.exports = {

    "haeKommentit" : (callback) => {
        //readfilellä haetaan kommentit ja palautetaan
        fs.readFile(kommentit, "utf-8", (err, data) => {

            if (err) throw err;

            return callback(JSON.parse(data));

        });
    },

    "haeUutiset" : (callback) => {
        //readfilellä uutisten haku
        fs.readFile(uutiset, "utf-8", (err, data) => {

            if (err) throw err;

            return callback(JSON.parse(data));
        });
    },

    "lisaaUusi" : (uusi, callback) => {
        //readfilellä kommenttien haku
        fs.readFile(kommentit, "utf-8", (err, data) => {

            if (err) throw err;

            //asetetaan muuttujaan
            let matkat = JSON.parse(data);
            //pushilla lisätään muuttujaan annettu kommentti
            matkat.push(uusi);
            //writefilellä kirjoitetaan annettu kommenttiobjekti tiedostoon
            fs.writeFile(kommentit, JSON.stringify(matkat, null, 2), (err) => {

                if (err) throw err;

                callback();

            });

        });


    },

    "poistakommentti" : (id, callback) => {
        //luetaan tiedosto
        fs.readFile(kommentit, "utf-8", (err, data) => {

            //muuttuja kommentteja varten
            let arr = JSON.parse(data);

            if (err) throw err;
            
            //muuttuja jonka avulla haetaan findindexillä vastaava kommenttiId
            let removeIndex = arr.findIndex( item => item.kommenttiId === id );
            //splicellä poistetaan
            arr.splice( removeIndex, 1 );
            //writefilellä kirjoitetaan uusi tiedosto
            fs.writeFile(kommentit, JSON.stringify(arr, null, 2), (err) => {

                if (err) throw err;

                callback();

            });
        });
    },

    "haeKayttaja" : (tunnus, callback) => {
        //luetaan käyttäjät
        fs.readFile(tiedostoKayttajat, "utf-8", (err, data) => {

            if (err) throw err;
            //muuttuja käyttäjiä varten
            let kayttajat = JSON.parse(data);
            //findindeksillä oikean etsiminen ja palautus
            let indeksi = kayttajat.findIndex((kayttaja) => {

                return kayttaja.kayttajatunnus == tunnus;

            });

            if (indeksi >= 0) {

                callback(kayttajat[indeksi]);

            } else {

                callback(null);
            }

        });

    },

    "haeKommenttijattaja" : (callback) => {
        //luetaan tiedosto
        fs.readFile(tiedostoKayttajat, "utf-8", (err, data) => {

            if (err) throw err;
            //asetetaan muuttujaan
            let kayttajat = JSON.parse(data);
            //array käyttäjiä varten
            let idkayttaja = [];
            //foreachilla käydään läpi ja pushilla lisätään id ja tunnus
            kayttajat.forEach((kayttaja) => {
                idkayttaja.push(
                    {
                        "kayttajaId" : kayttaja.kayttajaId,
                        "kayttajatunnus" : kayttaja.kayttajatunnus
                    }
                );
            });
            //palautetaan array missä käyttäjät ja idt
            callback(idkayttaja);

        });

    },

    "haeId" : (callback) => {

        //luetaan tiedosto
        fs.readFile(tiedostoKayttajat, "utf-8", (err, data) => {
            //asetetaan muuttujaan
            let kayttajat = JSON.parse(data);
            let index = 0;
            //foreachilla käydään läpi ja lisätään index muuttujaan 1
            kayttajat.forEach((kayttaja) => {
                index++
            });
            //palautetaan seuraava mahdollinen id
            callback(index + 1);

        });

    },

    "rekisteroi" : (uusi, callback) => {

        //luetaan käyttäjätiedosto
        fs.readFile(tiedostoKayttajat, "utf-8", (err, data) => {

            if (err) throw err;
            //asetetaan muuttujaan
            let matkat = JSON.parse(data);
            //pushilla lisätään parametrilla annettu array
            matkat.push(uusi);
            //kirjoitetaan tiedostoon
            fs.writeFile(tiedostoKayttajat, JSON.stringify(matkat, null, 2), (err) => {

                if (err) throw err;

                callback();

            });

        });

    }

};