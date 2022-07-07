import { Linking, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';

const sendEmail = (email, titulo, message) => {
    MailComposer.composeAsync({
        subject: titulo,
        recipients: [email],
        body: message,
    })
}

const sendEmailAnexo = (email, titulo, message, anexo) => {
    MailComposer.composeAsync({
        subject: titulo,
        recipients: [email],
        body: message,
        attachments: anexo,
    })
}

const sendWhatsApp = (text, phone) => {
    //console.log(phone);
    Linking.openURL(`whatsapp://send?text=${text}&phone=${phone}`);
}

const sendWhatsAppShare = async (anexo) => {
    await Sharing.shareAsync(anexo);
}


const handleConfirm = (titulo, mensagem, proximo) => {
    Alert.alert(
        titulo,
        mensagem,
        [
            {
                text: "Cancel",
                onPress: () =>
                    console.log("Cancel Pressed"),
                style: "cancel"
            },
            {
                text: "OK", onPress: () => {
                    proximo();
                }
            }
        ],
        { cancelable: false }
    );
};

const handleAlert = (titulo, mensagem, proximo) => {
    Alert.alert(
        titulo,
        mensagem,
        [
            {
                text: "OK", onPress: () => {
                    if (proximo !== null)
                        proximo();
                }
            }
        ],
        { cancelable: false }
    );
};

const getSaudacao = () => {
    var stamp = new Date();
    var time;
    var hours = stamp.getHours();
    //console.log(hours);
    //console.log(stamp);

    if (hours >= 18 && hours < 24) {
        time = "Boa Noite ";
    }

    if (hours >= 12 && hours < 18) {
        time = "Boa Tarde ";
    }

    if (hours >= 0 && hours < 12) {
        time = "Bom Dia ";
    }

    return time;
}

const verificaObjeto = (objeto) => {
    objeto = objeto.replace(/[^0-9]/g,'');
    if (objeto.length!=9){
        return false;
    }
    let final = 0;
    const dig = parseInt(objeto.substring(8));
    const soma =    ((parseInt(objeto.substring(0, 1))*8) +
                    (parseInt(objeto.substring(1, 2))*6) +
                    (parseInt(objeto.substring(2, 3))*4) +
                    (parseInt(objeto.substring(3, 4))*2) +
                    (parseInt(objeto.substring(4, 5))*3) +
                    (parseInt(objeto.substring(5, 6))*5) +
                    (parseInt(objeto.substring(6, 7))*9) +
                    (parseInt(objeto.substring(7, 8))*7));
     
   const resto = (soma % 11);
   if (resto==1){
       final = 0;
   }else if (resto==0){
        final = 5;
   }else{
       final = 11 - resto;
   }
   //console.log(final);
   //console.log(dig);
   return (final==dig);
}

export default {
    sendWhatsApp, sendEmail, handleAlert, handleConfirm,
    getSaudacao, sendEmailAnexo, sendWhatsAppShare, verificaObjeto
}