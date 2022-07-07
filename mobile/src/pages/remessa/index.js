import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, ScrollView, TouchableOpacity, Text, Dimensions, BackHandler } from 'react-native';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { Table, TableWrapper, Row, Cell, } from 'react-native-table-component';
import styles from './styles';
import api from '../../../services/api';
import funcoes from '../../../uses/funcoes';
import { Container, StyledIcon, Button, StyledIconCinza, ContainerRowbetween, Input, ContainerColumnstretch, Label } from './components';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import ModalSelector from 'react-native-modal-selector'

export default class remessa extends Component {

	constructor(props) {
		super(props);
		this._isMounted = false
		this._local = null;
		this.state = {
			textInputValue: "",
			veiculos: [],
			veiculo: [],
			items: [],
			item: [],
			selectedItems: [],
			itemIndex: 0,
			localinicio: [],
			objeto: '',
			usuario: '',
			obrigatorioagenda: 1,
			btnadd: true,
			tableHead: ['Total: 0', 'Objeto'],
			tableData: [],
			objetos: [],
			scanned: false,
			spinner: true,
			utilLeitor: false,
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

	getlocalizacao = async () => {
		try {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
				return;
			}

			this._local = await Location.watchPositionAsync({
				accuracy: Location.Accuracy.High
			},
				position => this.parseCoordinates(position)),
				error => {
					console.log(error)
					this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda })
				}
		} catch (e) {
			console.log(e)
			this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
		}
	}

	parseCoordinates = (position) => {
		try {
			const latitude = position.coords.latitude;
			const longitude = position.coords.longitude;
			let obj = {
				descricao: "Minha Localização Atual",
				cordenada: {
					latitude: latitude,
					longitude: longitude,
					locationChosen: false,
					latitudeDelta: 0.4,
					longitudeDelta: 0.4
				}
			}
			this.setState({ localinicio: [obj] });
			if (this._local != null) {
				this._local.remove();
			}
		} catch (e) {
			if (this._local != null) {
				this._local.remove();
			}
			console.log(e)
			this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
		}
	}

	componentDidMount() {
		this.setState({ usuario: this.props.route.params.usuario })
		this.setState({ obrigatorioagenda: this.props.route.params.obrigatorioagenda });
		this._isMounted = true;
		Dimensions.addEventListener('change', () => this.updateScreen());
		BackHandler.addEventListener("hardwareBackPress", this.handleSair);
		setTimeout(this.handleAddItens, 1000);

	}

	handleSetVeiculo = (item) => {
		this.setState({ textInputValue: item.label })
		this.setState({ veiculo: [item] });
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

	removeIndex = (index) => {
		var wTableData = [];
		var wObjetos = [];
		wTableData = [...this.state.tableData];
		wObjetos = [...this.state.objetos];
		wTableData.splice(index, 1);
		wObjetos.splice(index, 1);
		this.setState({ tableData: wTableData });
		this.setState({ objetos: wObjetos });
		this.setState({ tableHead: ['Total: ' + (this.state.objetos.length - 1), 'Objeto'] })
	}

	handleObjetoChange = (objeto) => {
		this.setState({ objeto });
		this.setState({ btnadd: objeto.length !== 13 })
	};

	handleaddObjeto = (objeto) => {
		let add = true;
		for (let i = 0; i < this.state.tableData.length; i++) {
			if (this.state.tableData[i].indexOf(objeto) > -1) {
				add = false;
				break;
			}
		}
		if (add) {
			this.handleVerificaObjeto(objeto);
		} else {
			funcoes.handleAlert('Mensagem', "Objeto existente na lista!", (this.state.utilLeitor ? this.HandleScannedProximo : null))
		}
	};


	handleBtnObjetoPress = () => {
		let add = true;
		for (let i = 0; i < this.state.tableData.length; i++) {
			if (this.state.tableData[i].indexOf(this.state.objeto) > -1) {
				add = false;
				break;
			}
		}
		if (add) {
			if (funcoes.verificaObjeto(this.state.objeto)) {
				this.handleVerificaObjeto(this.state.objeto);
			}else{
				funcoes.handleAlert('Mensagem', "Objeto inválido!", (this.state.utilLeitor ? this.HandleScannedProximo : null))		
			}
		} else {
			funcoes.handleAlert('Mensagem', "Objeto existente na lista!", (this.state.utilLeitor ? this.HandleScannedProximo : null))
		}
	};

	handleVoltarPress = () => {
		this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
	};

	handleSair = async () => {
		this.handleSpinner(false);
		try {
			await api.get('/usuario/sair');
		} catch (err) {
			console.log(err);
		}
		this.props.navigation.navigate('login');
	};

	handleSetItem = (item) => {
		this.setState({ item: [item] });
		this.setState({ selectedItems: item });
		var ide = this.state.items.findIndex(function (id) {
			if (id.id == item.id)
				return true;
		});
		this.setState({ itemIndex: ide.toString() });
	};

	handleVerificaObjeto = async (obj) => {
		this.setState({ spinner: true });
		try {
			let response = await api.get('/remessa/count/' + obj);
			let { sucesso } = response.data;
			if (!sucesso) {
				funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
			} else if (response.data.total > 0) {
				funcoes.handleAlert('Mensagem', "Objeto existente na base de dados!", ((this.state.utilLeitor === true) ? this.HandleScannedProximo : null));
			} else {
				var rowData = [];
				rowData.push(this.state.objetos.length + 1);
				rowData.push(obj);
				this.setState({ tableData: [...this.state.tableData, ...[rowData]] })
				this.setState({ objetos: [...this.state.objetos, ...[{ 'objeto': obj }]] })
				this.setState({ tableHead: ['Total: ' + (this.state.objetos.length), 'Objeto'] })
				this.setState({ objeto: '' });
				this.setState({ btnadd: true });
				setTimeout(() => { this.HandleScanned(this.state.utilLeitor) }, 1000);
			}
		} catch (err) {
			console.log(err);
			funcoes.handleAlert('Mensagem', "Falha na comunicação! Tente novamente mais tarde!", ((this.state.utilLeitor === true) ? this.HandleScannedProximo : null));
		}
		this.setState({ spinner: false });
	}

	handleAddItens = async () => {
		this.setState({ spinner: true });
		try {
			let response = await ((this.props.route.params.obrigatorioagenda > 0) ? api.get('/clientes/' + this.props.route.params.usuario) : api.get('/clientes/todos/' + this.props.route.params.usuario));
			let { sucesso } = response.data;
			if (sucesso) {
				this.setState({ items: response.data.clientes });
				if (!(this.state.obrigatorioagenda)) {
					await this.handleAddVeiculos();
				} else {
					setTimeout(this.getlocalizacao, 1000);
				}
			} else {
				funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
			}

		} catch (err) {
			console.log(err);
			funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", this.handleVoltarPress);
		}
		this.setState({ spinner: false });
	}

	handleAddVeiculos = async () => {
		this.handleSpinner(true);
		try {
			let response1 = await api.get('/veiculo/' + this.props.route.params.usuario);
			let { veiculo, sucesso } = response1.data;
			if (sucesso) {
				let data = [];
				veiculo.forEach(item => {
					data.push({ key: item.id, label: item.name });
				});
				this.setState({ veiculos: data });
				setTimeout(this.getlocalizacao, 1000);
			} else {
				funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
			}
		} catch (err) {
			console.log(err);
			funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", this.handleVoltarPress);
		}
		this.handleSpinner(false);
	}


	handleFinaliza = () => {
		//this.handleSpinner(false);
		this.props.navigation.navigate('compartilharobjeto', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda, cliente: this.state.item[0].id, objetos: this.state.objetos });
	}

	handleSpinner = (valor) => {
		this.setState({ spinner: valor });
	}

	handleFinalizarPress = async () => {
		this.handleSpinner(true);
		var data = {
			"cliente": this.state.item[0].id,
			"usuario": this.state.usuario,
			"dthr": new Date(),
			"latitude": this.state.localinicio[0].cordenada.latitude,
			"longitude": this.state.localinicio[0].cordenada.longitude,
			"veiculo_id": ((this.state.veiculo.length > 0) ? this.state.veiculo[0].key : 0),
			"itens": this.state.objetos
		}
		try {
			let response = await api.post('/remessa', data, { headers: { "Content-Type": "application/json" } });
			let { sucesso } = response.data;
			if (sucesso) {
				funcoes.handleAlert("Mesagem", "Lista salva com sucesso!", this.handleFinaliza);
			} else {
				funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
			}

		} catch (err) {
			console.log(err);
			funcoes.handleAlert("Mesagem", "Ocorreu uma falha! Tente novamente mais tarde.", null);
		}
		this.handleSpinner(false);
	}

	handleBarCodeScanned = ({ data }) => {
		console.log(data);
		let linha = data;
		if (linha.length > 43) {
			linha = linha.substring(29);
			linha = linha.substring(0, 13);
		}
		this.setState({ scanned: false });
		if ((linha.length === 13) && 
		   (funcoes.verificaObjeto(linha))) {
			this.handleaddObjeto(linha);
		} else {
			funcoes.handleAlert('Mensagem', "Codigo barras inválido!", null);

		}
	};

	HandleScanned = (acao) => {
		this.setState({ scanned: acao });
		this.setState({ utilLeitor: acao });
	}

	HandleScannedProximo = () => {
		this.HandleScanned(true);
	}

	render() {
		const { CameraPermissionGranted, scanned, screen, selectedItems, tableData,
			items, itemIndex, objeto, btnadd, item, objetos, tableHead, spinner } = this.state

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
						<Button style={styles.ButtonLeitor} onPress={() => this.HandleScanned(false)}>
							<Text style={styles.ButtonLeitorText}>
								<StyledIcon
									size={15}
									name="barcode" /> Cancelar leitor de código de barra</Text>
						</Button>
					</ContainerColumnstretch>
				</View>
			);
		}
		const element = (data, index) => (
			<TouchableOpacity onPress={() => this.removeIndex(index)}>
				<View style={styles.btnrow}>
					<StyledIcon size={18} name="trash-o" />
				</View>
			</TouchableOpacity>
		);
		return (

			<Container>
				<View style={styles.Principal}>
					<View style={styles.BoxInicial}>
						{(!(this.state.obrigatorioagenda > 0)) && <ContainerColumnstretch>
							<ModalSelector
								data={this.state.veiculos}
								initValue="selecione o veículo!"
								supportedOrientations={['landscape']}
								accessible={true}
								scrollViewAccessibilityLabel={'Scrollable options'}
								cancelButtonAccessibilityLabel={'Cancel Button'}
								onChange={(option) => this.handleSetVeiculo(option)}>
								<ContainerRowbetween>
									<TextInput
										style={styles.TextInputModal}
										editable={false}
										placeholder="selecione o veículo da coleta"
										value={this.state.textInputValue} />
									<StyledIconCinza style={styles.IconModal} name="chevron-right" size={24} />
								</ContainerRowbetween>
							</ModalSelector>
						</ContainerColumnstretch>}

						<ContainerColumnstretch>
							<Label>Selecione o cliente abaixo:</Label>
							<SearchableDropdown
								selectedItems={selectedItems}
								onTextChange={text => (text)}
								onItemSelect={(item, index) => this.handleSetItem(item, index)}
								containerStyle={styles.ContainerStyle}
								textInputStyle={styles.TextInputStyle}
								itemStyle={styles.ItemStyle}
								itemTextStyle={styles.ItemTextStyle}
								itemsContainerStyle={styles.ItemsContainerStyle}
								items={items}
								defaultIndex={itemIndex}
								placeholder="selecione o cliente"
								resetValue={false}
								underlineColorAndroid="transparent"
								width="100%" />
						</ContainerColumnstretch>
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
										<StyledIcon
											size={22}
											name="plus" />
									</Button>
								</ContainerRowbetween>
							</ContainerColumnstretch>
							<ContainerColumnstretch>
								<Button style={styles.ButtonLeitor} onPress={() => this.HandleScanned(true)}>
									<Text style={styles.ButtonLeitorText}>
										<StyledIcon
											size={15}
											name="barcode" /> Iniciar leitor de código de barra</Text>
								</Button>
							</ContainerColumnstretch>
							<ContainerColumnstretch>
								<Button
									onPress={this.handleFinalizarPress}
									style={((item.length > 0) && (objetos.length > 0) && ((this.state.obrigatorioagenda > 0) || (this.state.veiculo.length > 0))) ? styles.ButtonFinalizarAtivo : styles.ButtonFinalizarInativo}
									disabled={!((item.length > 0) && (objetos.length > 0) && ((this.state.obrigatorioagenda > 0) || (this.state.veiculo.length > 0)))}>
									<Text style={styles.ButtonText}>Finalizar</Text>
								</Button>
							</ContainerColumnstretch>

							<View style={styles.ContainerTable}>
								<Table borderStyle={styles.TableborderStyle}>
									<Row data={tableHead} style={styles.head} textStyle={styles.headtext} />
									{
										tableData.map((rowData, index) => (
											<TableWrapper key={index} style={[styles.row, index % 2 && { backgroundColor: '#F7F6E7' }]}>
												{
													rowData.map((cellData, cellIndex) => (
														<Cell key={cellIndex} data={cellIndex === 0 ? element(cellData, index) : cellData} textStyle={styles.rowtext} />
													))
												}
											</TableWrapper>
										))
									}
								</Table>
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