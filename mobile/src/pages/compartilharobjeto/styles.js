import { StyleSheet } from 'react-native';
export default StyleSheet.create({
	Principal:{padding: 20,  flex:1 },
	BoxInicial:{flex:2, marginTop:20},
	BoxRodape: {height: 40, borderRadius: 30, backgroundColor: "#FFF", justifyContent: "flex-end",  flexDirection:"column", alignContent:"center", marginHorizontal:20},
    ButtonEmailAtivo: {padding: 15, backgroundColor: "orange", height: 50, width: '100%', opacity: 1},
	ButtonEmailInativo: {padding: 15, backgroundColor: "orange", height: 50, width: '100%', opacity: 0.25},
    ButtonWhatsAtivo: {padding: 15, backgroundColor: "#3CB371", height: 50, width: '100%', opacity: 1},
	ButtonWhatsInativo: {padding: 15, backgroundColor: "#3CB371", height: 50, width: '100%', opacity: 0.25},
	ButtonCancelar: {padding: 15, backgroundColor: "#FF6347", height: 50, width: '100%'},
	ButtonText: {color: "#FFF", fontWeight: "bold", fontSize: 20},    
	tituloResultado: {alignItems: "center", justifyContent: "center"}, 
	tituloResultadotexto: {fontSize: 24, color: "#4F4F4F", marginTop: 20, fontWeight: "bold"}, 
	titulotexto: { marginLeft: 5, color: "#4F4F4F", fontWeight: "bold", fontSize: 18,}, 
	resultadotexto: { marginRight: 5, color: "#4F4F4F", fontSize: 18,},
	container: {flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', },
	containerlist:{flexDirection: 'row', justifyContent: 'space-between', margin: 5},
	ButtonTextErro: {color: "#F63535", fontWeight: "bold", fontSize: 20},
    ButtonTransparentAtivo: {padding: 15, backgroundColor: "transparent", height: 50, marginHorizontal:5, opacity: 1},
    ButtonTextVoltar:{color: "#F63535", fontWeight: "bold", fontSize: 15},
    ButtonVoltar:{backgroundColor: "transparent", height: 20, marginHorizontal:5, opacity: 1},
    
});