import { StyleSheet } from 'react-native';
import  Constants  from 'expo-constants';
export default StyleSheet.create({
	Principal:{flex:1},
	modal: {flex: 1, backgroundColor: '#DC143C', padding: 15, margin: 30, borderRadius: 30, marginVertical: 40},
	modalheader: {height: 50, padding: 10, borderEndColor: "#CCC", justifyContent: "flex-start"},
	modalheadertext: {color: "#FFD700", fontWeight: "bold", fontSize: 25},
	modalbody: {flex: 1, alignItems: "center", justifyContent: "center"},
	modalfooter: {height: 100, padding: 10, justifyContent: "flex-end", flexDirection:"column"},
	modaltext: { color: '#CCC', marginTop: 10, fontSize: 24},
	container:{flex: 1, paddingHorizontal: 24, backgroundColor: "#CCC", paddingTop: Constants.statusBarHeight + 20,}, 
	ContainerScroll: { flexGrow: 1, justifyContent: 'center' },
	Boxmsg:{flex:2, flexDirection: "column", justifyContent:"center", alignItems:"center"},
	BoxRodape: {height: 100, justifyContent: "flex-end",  flexDirection:"column", alignContent:"center", marginHorizontal:10},
	texttitle:{fontSize: 24, fontWeight: "bold",   marginVertical:15, color: "orange" },
	texterro:{fontSize: 20, fontWeight: "bold", color: "red" },
	textok:{fontSize: 20, fontWeight: "bold", color: "green" }, 	
	texterro:{fontSize: 20, fontWeight: "bold", color: "red" }, 	
	enderecos: {borderRadius: 8,  backgroundColor: '#FFF', padding: 30},
	enderecosProperty: {fontSize: 20, color: '#41414d', fontWeight: 'bold'} ,
	spinnerTextStyle: { color: '#FFF'},
	green: {backgroundColor: "#3CB371"},
	yellow: {color: "#FFD700"},
    containerspinner: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5FCFF'},
    
});