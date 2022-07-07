import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, AsyncStorage, View, PermissionsAndroid, Text, Modal, BackHandler } from 'react-native';
import api from '../../../services/api';
import styles from './styles';
import funcoes from '../../../uses/funcoes';
import Spinner from 'react-native-loading-spinner-overlay';
import { Container, Button, ButtonText, StyledIcon, BtnContainer, ContainerColumnstretch, ContainerRowbetween } from './components';
export default class main extends Component {
	//Esse trecho indica que nesse componente é necessário a passagem de um objeto navigation que contenha as funções navigate e dispatch.
	static propTypes = {
		navigation: PropTypes.shape({
			navigate: PropTypes.func,
			dispatch: PropTypes.func,
		}).isRequired,
	};

	
	constructor(props) {
		super(props);
		this.state = {
			usuario: '',
			obrigatorioagenda: 1,
			spinner: true,
			hasAudioPermission: true,
			hasCameraPermission: true,
			hasLocalizacaoPermission: true,
			bloqueio: false,
			bloqueiomsg: "",
			trocaoleo: false,
			agendamentoatraso: false,
			modalalert: false
		};
		
	}

	componentDidMount() {
		this.setState({ usuario: this.props.route.params.usuario });
		this.setState({obrigatorioagenda: this.props.route.params.obrigatorioagenda});
		this.getBloqueio();
		setTimeout(this.requestMultiplePermission, 1000);
		BackHandler.addEventListener("hardwareBackPress", this.handleSair);
	}

	componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleSair);
    }

	getBloqueio = async () => {
		try {
			let response = await api.get('/bloqueio/' + this.props.route.params.usuario);
			let { sucesso, bloqueio } = response.data;
			if (sucesso) {
				let { distancia, bloquear, bloqueiotipo } = bloqueio;
				if (bloquear > 0) {
					this.setState({ bloqueio: true });
					this.setState({ bloqueiomsg: bloqueiotipo[0].msg });
					this.setState({ trocaoleo: (bloqueiotipo[0].tipo === "T") });
					this.setState({ agendamentoatraso: (bloqueiotipo[0].tipo === "A") });
				} else if (distancia > 1000) {
					this.setState({ modalalert: true });
					this.setState({ bloqueiomsg: "Por favor realizar a troca de óleo do seu veículo! Caso isso não ocorra até o proximo dia útil, seu app será bloqueado." });
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	requestMultiplePermission = async () => {
		this.setState({ spinner: false });
		try {
			const permissions = [
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
				PermissionsAndroid.PERMISSIONS.CAMERA,
				PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
			]
			// Return is the object type
			const granteds = await PermissionsAndroid.requestMultiple(permissions);
			this.setState({ hasLocalizacaoPermission: (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted") });
			this.setState({ hasCameraPermission: (granteds["android.permission.CAMERA"] === "granted") });
			this.setState({ hasAudioPermission: (granteds["android.permission.RECORD_AUDIO"] === "granted") });

		} catch (_err) {
			console.log(_err);
		}
	}


	handlePesquisaPress = () => {
		this.props.navigation.navigate('consulta', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
	};
	handleRotaPress = () => {
		this.props.navigation.navigate('rota', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
	};
	handleRotaFinalizarPress = () => {
		this.props.navigation.navigate('rotafinalizar', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
	}
	handleRemessaPress = () => {
		this.props.navigation.navigate('remessa', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
	};

	handleRequisicaoPress = () => {
		this.props.navigation.navigate('requisicao', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
	};

	handleSair = async () => {
		try {
			const response = await api.get('/usuario/sair');
			AsyncStorage.setItem('@MRSApp:token', null);
		} catch (err) {
			console.log(err);
		}
		this.props.navigation.navigate('login');
	}

	handleSairPress = () => {
		funcoes.handleConfirm("Mesagem", "Deseja realmente sair do app?", this.handleSair);
	};

	handleRegistraPress = () => {
		this.setState({ bloqueio: false });
		this.setState({ trocaoleo: false });
		this.props.navigation.navigate('trocaoleo', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
	}


	render() {

		const { modalalert, spinner, hasAudioPermission, hasCameraPermission,
			hasLocalizacaoPermission, bloqueiomsg, agendamentoatraso, trocaoleo } = this.state;

		if (spinner) {
			return (
				<View style={styles.containerspinner}>
					<Spinner
						visible={spinner}
						textContent={'Loading...'}
						textStyle={styles.spinnerTextStyle}
					/>
				</View>
			);
		}

		if (!(hasAudioPermission && hasCameraPermission && hasLocalizacaoPermission)) {
			return (
				<View style={styles.Principal}>
					<View style={styles.Boxmsg}>
						<View style={styles.enderecos}>
							<Text style={styles.texttitle}>Falha nas permissões</Text>
							<ContainerColumnstretch>
								<ContainerRowbetween>
									<Text style={styles.enderecosProperty}>Camera:</Text>
									<Text style={(hasCameraPermission ? styles.textok : styles.texterro)}>{(hasCameraPermission ? "OK" : "SEM PERMISSÃO")}</Text>
								</ContainerRowbetween>
							</ContainerColumnstretch>
							<ContainerColumnstretch>
								<ContainerRowbetween>
									<Text style={styles.enderecosProperty}>Audio:</Text>
									<Text style={(hasAudioPermission ? styles.textok : styles.texterro)}>{(hasAudioPermission ? "OK" : "SEM PERMISSÃO")}</Text>
								</ContainerRowbetween>
							</ContainerColumnstretch>
							<ContainerColumnstretch>
								<ContainerRowbetween>
									<Text style={styles.enderecosProperty}>Localização:</Text>
									<Text style={(hasLocalizacaoPermission ? styles.textok : styles.texterro)}>{(hasLocalizacaoPermission ? "OK" : "SEM PERMISSÃO")}</Text>
								</ContainerRowbetween>
							</ContainerColumnstretch>
						</View>
					</View>
					<View style={styles.BoxRodape}>
						<Button onPress={this.handleSairPress}>
							<BtnContainer>
								<StyledIcon name="close" />
								<ButtonText>Sair do aplicativo</ButtonText>
							</BtnContainer>
						</Button>
					</View>

				</View>
			)
		}


		return (
			<Container>
				<View style={styles.Principal}>
					<Modal
						animationType={'slide'}
						transparent={false}
						visible={modalalert}
						onRequestClose={() => {
							this.setState({ modalalert: false });
						}}
					>
						<View style={styles.modal}>
							<View style={styles.modalheader}>
								<Text style={styles.modalheadertext}><StyledIcon style={styles.yellow} name="warning" /> Atenção!</Text>
							</View>
							<View style={styles.modalbody}>
								<Text style={styles.modaltext}>{bloqueiomsg}</Text>
							</View>
							<View style={styles.modalfooter}>
								<Button style={styles.green} onPress={() => { this.setState({ modalalert: false }); }}>
									<ButtonText>Ok</ButtonText>
								</Button>
							</View>

						</View>
					</Modal>

					<Modal
						animationType={'slide'}
						transparent={false}
						visible={trocaoleo||agendamentoatraso}
						onRequestClose={() => {
							//this.setState({ trocaoleo: false });
						}}
					>
						<View style={styles.modal}>
							<View style={styles.modalheader}>
								<Text style={styles.modalheadertext}><StyledIcon style={styles.yellow} name="warning" /> Bloqueado!</Text>
							</View> 
							<View style={styles.modalbody}>
								<Text style={styles.modaltext}>Motivo do bloqueio: {bloqueiomsg}</Text>
							</View>
							<View style={styles.modalfooter}>
								{(!agendamentoatraso) && <Button style={styles.green} onPress={this.handleRegistraPress}>
									<ButtonText>Registrar troca de óleo</ButtonText>
								</Button>}
								<Button onPress={this.handleSair}>
									<BtnContainer>
										<StyledIcon name="close" />
										<ButtonText>Sair do aplicativo</ButtonText>
									</BtnContainer>
								</Button>
							</View>

						</View>
					</Modal>


					<ScrollView contentContainerStyle={styles.ContainerScroll}>
						<Button onPress={this.handleRotaPress}>
							<BtnContainer>
								<StyledIcon name="map-marker" />
								<ButtonText>Iniciar/Visualizar Rota</ButtonText>
							</BtnContainer>
						</Button>
						<Button onPress={this.handleRotaFinalizarPress}>
							<BtnContainer>
								<StyledIcon name="check" />
								<ButtonText>Finalizar Rota</ButtonText>
							</BtnContainer>
						</Button>
						<Button onPress={this.handleRequisicaoPress}>
							<BtnContainer>
								<StyledIcon name="camera" />
								<ButtonText>Coletar Requisição</ButtonText>
							</BtnContainer>
						</Button>
						<Button onPress={this.handleRemessaPress}>
							<BtnContainer>
								<StyledIcon name="barcode" />
								<ButtonText>Coletar Objeto</ButtonText>
							</BtnContainer>
						</Button>
						<Button onPress={this.handlePesquisaPress} >
							<BtnContainer>
								<StyledIcon name="search" />
								<ButtonText>Consultar Objeto</ButtonText>
							</BtnContainer>
						</Button>
						<Button onPress={this.handleSairPress}>
							<BtnContainer>
								<StyledIcon name="close" />
								<ButtonText>Sair do aplicativo</ButtonText>
							</BtnContainer>
						</Button>
					</ScrollView>
				</View>

			</Container>
		);
	}
}