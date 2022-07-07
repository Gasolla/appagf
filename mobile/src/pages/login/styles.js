import { StyleSheet } from 'react-native';
import  Constants  from 'expo-constants';
export default StyleSheet.create({
	Principal:{padding: 20 },
	container:{flex: 1, paddingHorizontal: 24, backgroundColor: "#CCC",paddingTop: Constants.statusBarHeight + 20,}, 
	ContainerScroll: { flexGrow: 1, justifyContent: 'center' },
	spinnerTextStyle: { color: '#FFF'},
    containerspinner: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5FCFF'},
    
});