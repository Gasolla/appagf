import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const AppStack = createStackNavigator();

import login from './pages/login';
import remessa from './pages/remessa';
import consulta from './pages/consulta';
import main from './pages/main';
import compartilharobjeto from './pages/compartilharobjeto';
import compartilharrequisicao from './pages/compartilharrequisicao';
import rota  from './pages/rota';
import rotafinalizar  from './pages/rotafinalizar';
import requisicao from './pages/requisicao';
import trocaoleo from './pages/trocaoleo';


export default function Routes() {
	return (
		<NavigationContainer>
			<AppStack.Navigator screenOptions={{ headerShown: false, headerTintColor: 'white', headerTitleAlign: "center", headerStyle: { backgroundColor: '#363636' }}}>
				<AppStack.Screen name="login" component={login} options={{title: ''}}/>
				<AppStack.Screen name="remessa" component={remessa} options={{title: 'Coletor Objeto'}} />
				<AppStack.Screen name="requisicao" component={requisicao} options={{title: 'Coletar Requisição'}} />
				<AppStack.Screen name="consulta" component={consulta} options={{ title: 'Consultar Objeto'}}/>
				<AppStack.Screen name="compartilharobjeto" component={compartilharobjeto} options={{title: 'Enviar para o cliente'}} />
				<AppStack.Screen name="compartilharrequisicao" component={compartilharrequisicao} options={{title: 'Enviar para o cliente'}} />
				<AppStack.Screen name="main" component={main} options={{ title: 'Pagina Inicial'}} />
				<AppStack.Screen name="rota" component={rota} options={{ title: 'Iniciar Rotas'}} />
				<AppStack.Screen name="rotafinalizar" component={rotafinalizar} options={{ title: 'Finaliza Rotas'}} />
				<AppStack.Screen name="trocaoleo" component={trocaoleo} options={{ title: 'Registrar troca óleo'}} />
			</AppStack.Navigator>
		</NavigationContainer>
	);
}