import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    Principal:{padding: 20, flex:1},
    BoxInicial:{flex:2, marginTop:20},
    Box1:{flex:2, justifyContent:"center", flexDirection:"column", alignContent:"center",},
    Box2:{flex:1, justifyContent:"flex-end"},
    BoxCabecalho: {height: 35, justifyContent: "space-between", flexDirection:"row", padding:10, marginTop:10},
    textcabecalho: {fontWeight: "bold"}, 
    BoxRodape: {height: 40, borderRadius: 30, backgroundColor: "#FFF", justifyContent: "flex-end",  flexDirection:"column", alignContent:"center", marginHorizontal:20},
    BoxRodapespace: {justifyContent: "space-between",  flexDirection:"row"},
    enderecosList: {marginVertical: 10, marginHorizontal: 10,},
    enderecos: {padding: 10,  borderRadius: 8,  backgroundColor: '#FFF', marginBottom: 16},
    enderecosselecionado: {padding: 10,  borderRadius: 8,  backgroundColor: '#BBFDC0', marginBottom: 16},
    enderecosProperty: {fontSize: 15, color: '#41414d', fontWeight: 'bold'} ,
    enderecosValue: {fontSize: 15, color: '#737380'}, 
    container: {flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end',},
    ButtonVoltar:{padding: 15, backgroundColor: "transparent", height: 20, marginHorizontal:5, opacity: 1},
    ButtonTextVoltar:{color: "#F63535", fontWeight: "bold", fontSize: 15},
    containerScanner: {flex: 1, flexDirection: 'column', justifyContent: 'flex-end'},
    spinnerTextStyle: { color: '#FFF'},
    containerspinner: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5FCFF'},
    ButtonLeitor: {padding: 5, backgroundColor: "#363636", height: 35},
    ButtonLeitorText: {color: "#FFF", fontWeight: "bold", fontSize: 16},
    ButtonFinalizar: {padding: 15, backgroundColor: "green", height: 40, opacity: 1, borderRadius: 10, marginHorizontal:5},
    ButtonText: {color: "#FFF", fontWeight: "bold", fontSize: 20},
    Boxmsg:{flex:2, flexDirection: "column", justifyContent:"center", alignItems:"center"},
    textmsg:{fontSize:20, fontWeight: "bold", },   
});