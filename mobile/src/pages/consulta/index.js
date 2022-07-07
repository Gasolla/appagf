import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { View, ScrollView, Text, Dimensions, BackHandler } from 'react-native';
import styles from './styles';
import api from '../../../services/api';
import funcoes from '../../../uses/funcoes';
import { Container, StyledIcon, Button, ContainerRowbetween, Input, ContainerColumnstretch, Label } from './components';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Spinner from 'react-native-loading-spinner-overlay';

//const DEVICE_WIDTH = Dimensions.get('window').width;
//const DEVICE_HEIGHT = Dimensions.get('window').height;

export default class consulta extends Component {



	constructor(props) {
		super(props);
		this._isMounted = false
		this.state = {
			objeto: '',
			usuario: '',
			obrigatorioagenda: 1,
			cliente: '',
			data: '',
			datapostagem: '',
			dataentrega: '',
			rastreador: '',
			status: '',
			descricao: '',
			booresult: false,
			btnadd: true,
			spinner: false,
			scanned: false,
			screen: {
				orientation: Dimensions.get('screen').width < Dimensions.get('screen').height,
				height: Dimensions.get('screen').height,
				width: Dimensions.get('screen').width
			}
		};
	}

	//Esse trecho indica que nesse componente é necessário a passagem de um objeto navigation que contenha as funções navigate e dispatch.
	static propTypes = {
		navigation: PropTypes.shape({
			navigate: PropTypes.func,
			dispatch: PropTypes.func,
		}).isRequired,
	};

	componentDidMount() {
		this.setState({ usuario: this.props.route.params.usuario });
		this.setState({obrigatorioagenda: this.props.route.params.obrigatorioagenda});
		this._isMounted = true;
		Dimensions.addEventListener('change', () => this.updateScreen());
		BackHandler.addEventListener("hardwareBackPress", this.handleSair);
	}

	componentWillUnmount() {
		this._isMounted = false
		Dimensions.removeEventListener('change', () => this.updateScreen());
		BackHandler.removeEventListener("hardwareBackPress", this.handleSair);
	}

	updateScreen = () => {
		const dim = Dimensions.get('screen');
		if (this._isMounted) {
			this.setState({
				screen: {
					orientation: dim.width < dim.height,
					width: dim.width,
					height: dim.height
				}
			})
		}
	}

	handleObjetoChange = (objeto) => {
		this.setState({ objeto });
		this.setState({ btnadd: objeto.length !== 13 })
	};

	handleBarCodeScanned = ({ data }) => {
		let linha = data;
		if (linha.length > 43) {
			linha = linha.substring(29);
			linha = linha.substring(0, 13);
		}
		this.setState({ scanned: false });
		if ((linha.length === 13) && 
		    (funcoes.verificaObjeto(linha))) {
			this.handleGetObjeto(linha);
		} else {
			funcoes.handleAlert('Mensagem', "Codigo barras inválido!", null);

		}
	};


	handleGetObjeto = async (objeto) => {
		this.setState({ spinner: true });
		try {
			let response = await api.get('/remessa/' + objeto);
			let { sucesso, clientes } = response.data;
			if (!sucesso) {
				funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
			} else {
				if (response.headers['x-total-count'] > 0) {
					//Moment.locale('br');
					this.setState({ booresult: true });
					this.setState({ cliente: clientes[0].cliente });
					this.setState({ data: (Moment(clientes[0].dthr).format('DD/MM/YYYY')) });
					this.setState({ rastreador: clientes[0].objeto });
					this.setState({ datapostagem: (Moment(clientes[0].datapostagem).format('DD/MM/YYYY')) });
					this.setState({ dataentrega: (Moment(clientes[0].dataentrega).format('DD/MM/YYYY')) });
					this.setState({ status: clientes[0].apelido });
					this.setState({ descricao: clientes[0].descricao });
				} else {
					funcoes.handleAlert('Mensagem', 'Objeto não encontrado!', null);
				}
			}
		} catch (err) {
			console.log(err)
			funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
		}
		this.setState({ spinner: false });

	};

	handleBtnObjetoPress = async () => {
		this.setState({ spinner: true });
		try {
			let response = await api.get('/remessa/' + this.state.objeto);
			let { sucesso, clientes } = response.data;
			if (!sucesso) {
				funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
			} else {
				if (response.headers['x-total-count'] > 0) {
					//Moment.locale('br');
					this.setState({ booresult: true });
					this.setState({ cliente: clientes[0].cliente });
					this.setState({ data: (Moment(clientes[0].dthr).format('DD/MM/YYYY')) });
					this.setState({ rastreador: clientes[0].objeto });
					this.setState({ datapostagem: (Moment(clientes[0].datapostagem).format('DD/MM/YYYY')) });
					this.setState({ dataentrega: (Moment(clientes[0].dataentrega).format('DD/MM/YYYY')) });
					this.setState({ status: clientes[0].apelido });
					this.setState({ descricao: clientes[0].descricao });
				} else {
					funcoes.handleAlert('Mensagem', 'Objeto não encontrado!', null);
				}
			}
		} catch (err) {
			console.log(err)
			funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
		}
		this.setState({ spinner: false });
	};

	handleNovoPress = () => {
		this.setState({ booresult: false });
		this.setState({ cliente: '' });
		this.setState({ data: '' });
		this.setState({ rastreador: '' });
		this.setState({ datapostagem: '' });
		this.setState({ dataentrega: '' });
		this.setState({ status: '' });
		this.setState({ descricao: '' });
		this.setState({ objeto: '' });
		this.setState({ btnadd: true });
	}

	handleVoltarPress = () => {
		this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
	};

	handleSair = async () => {
		try {
			await api.get('/usuario/sair');
		} catch (err) {
			console.log(err)
		}
		this.props.navigation.navigate('login');
	};


	render() {
		const { scanned, screen, objeto, btnadd, booresult,
			cliente, data, rastreador, datapostagem, dataentrega, status, descricao, spinner } = this.state;



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

		if (scanned === true) {
			return (
				<View
					style={styles.containerScanner}>
					<BarCodeScanner
						onBarCodeScanned={scanned ? this.handleBarCodeScanned : undefined}
						style={{ height: screen.height / 1.1, width: screen.width, }}
					/>
					<ContainerColumnstretch>
						<Button style={styles.ButtonLeitor} onPress={() => this.setState({ scanned: false })}>
							<Text style={styles.ButtonLeitorText}>
								<StyledIcon
									size={15}
									name="barcode" /> Cancelar leitor de código de barra</Text>
						</Button>
					</ContainerColumnstretch>
				</View>
			);
		}
		return (

			<Container>
				<View style={styles.Principal}>
					<View style={styles.BoxInicial}>

						<ScrollView >
							<ContainerColumnstretch>
								<Label>Digite o número do objeto:</Label>
								<ContainerRowbetween>
									<Input style={styles.InputObjeto}
										placeholder="Objeto"
										value={objeto}
										onChangeText={this.handleObjetoChange}
										autoCorrect={false}
									/>
									<Button
										style={btnadd ? styles.ButtonObjetoInativo : styles.ButtonObjetoAtivo}
										onPress={this.handleBtnObjetoPress}
										disabled={btnadd}>
										<StyledIcon size={22} name="search" />
									</Button>
								</ContainerRowbetween>
							</ContainerColumnstretch>
							<ContainerColumnstretch>
								<Button style={styles.ButtonLeitor} onPress={() => this.setState({ scanned: true })}>
									<Text style={styles.ButtonLeitorText}>
										<StyledIcon
											size={15}
											name="barcode" /> Iniciar leitor de código de barra</Text>
								</Button>
							</ContainerColumnstretch>
							<ContainerColumnstretch>
								<Button
									style={booresult ? styles.ButtonLimparAtivo : styles.ButtonLimparInativo}
									onPress={this.handleNovoPress}
									disabled={(!booresult)}>
									<Text style={styles.ButtonText}>Nova Consulta</Text>
								</Button>
							</ContainerColumnstretch>
							<View style={booresult ? { display: "flex" } : { display: "none" }}>
								<View style={styles.tituloResultado}>
									<Text style={styles.tituloResultadotexto}>Resultado</Text>
								</View>
								<ContainerColumnstretch>
									<ContainerRowbetween>
										<Text style={styles.titulotexto}>Cliente:</Text>
										<Text style={styles.resultadotexto}>{cliente}</Text>
									</ContainerRowbetween>
									<ContainerRowbetween>
										<Text style={styles.titulotexto}>Data Coleta:</Text>
										<Text style={styles.resultadotexto}>{data}</Text>
									</ContainerRowbetween>
									<ContainerRowbetween>
										<Text style={styles.titulotexto}>Objeto:</Text>
										<Text style={styles.resultadotexto}>{rastreador}</Text>
									</ContainerRowbetween>
									<ContainerRowbetween>
										<Text style={styles.titulotexto}>Data Postagem:</Text>
										<Text style={styles.resultadotexto}>{(datapostagem != '01/01/1900') && datapostagem}</Text>
									</ContainerRowbetween>
									<ContainerRowbetween>
										<Text style={styles.titulotexto}>Data Entrega:</Text>
										<Text style={styles.resultadotexto}>{(dataentrega != '01/01/1900') && dataentrega}</Text>
									</ContainerRowbetween>
									<ContainerRowbetween>
										<Text style={styles.titulotexto}>Status:</Text>
										<Text style={styles.resultadotexto}>{status}</Text>
									</ContainerRowbetween>
									<ContainerRowbetween>
										<Text style={styles.titulotexto}>Descrição:</Text>
										<Text style={styles.resultadotexto}>{descricao}</Text>
									</ContainerRowbetween>
								</ContainerColumnstretch>
							</View>
						</ScrollView>
						<View style={styles.BoxRodape}>
							<ContainerColumnstretch>
								<Button style={styles.ButtonVoltar}
									onPress={this.handleVoltarPress}>
									<Text style={styles.ButtonTextVoltar}>Voltar ao menu principal</Text>
								</Button>
							</ContainerColumnstretch>
						</View>
					</View>
				</View>
			</Container>
		);
	}
}