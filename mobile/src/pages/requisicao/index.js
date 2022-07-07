import React from 'react';
import PropTypes from 'prop-types';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { Camera } from 'expo-camera';
//import { Permissions } from 'expo';
import { View, Text, TextInput, ScrollView, Image, BackHandler } from 'react-native';
import api from '../../../services/api';
import funcoes from '../../../uses/funcoes';
import styles from './styles';
import Toolbar from './toolbar.component';
import Gallery from './gallery.component';
import { Container, StyledIcon, StyledIconCinza, Button, ContainerRowbetween, ContainerColumnstretch, Label } from './components';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import ModalSelector from 'react-native-modal-selector'

export default class requisicao extends React.Component {

    constructor(props) {
        super(props);
        this.camera = null;
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
            usuario: '',
            obrigatorioagenda: 1,
            coleta: '',
            captures: [],
            capturing: null,
            spinner: true,
            hasCameraPermission: false,
            cameraType: Camera.Constants.Type.back,
            flashMode: Camera.Constants.FlashMode.off,
            capture: false,
        };
    }

    //Esse trecho indica que nesse componente é necessário a passagem de um objeto navigation que contenha as funções navigate e dispatch.
    static propTypes = {
        navigation: PropTypes.shape({
            navigate: PropTypes.func,
            dispatch: PropTypes.func,
        }).isRequired,
    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

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

    handleCaptureOut = () => {
        if (this.state.capturing) {
            this.camera.stopRecording();
            setTimeout(() => {
                this.handleSetCapture();
            }, 2000);
        }
    };

    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync({ base64: true, quality: 0.1 });
        this.setState({ capturing: false, captures: [photoData, ...this.state.captures] })
    };

    handleSetCapture = () => this.setState({ capture: false });

    handleLongCapture = async () => {
        const videoData = await this.camera.recordAsync();
        this.setState({ capturing: false, captures: [videoData, ...this.state.captures] });
    };

    async  componentDidMount() {
        this.setState({ usuario: this.props.route.params.usuario })
        this.setState({ obrigatorioagenda: this.props.route.params.obrigatorioagenda });
        const { status } = await Camera.requestPermissionsAsync();
        this.setState({ hasCameraPermission: status === 'granted' });
        BackHandler.addEventListener("hardwareBackPress", this.handleSair);
        setTimeout(this.handleAddItens, 1000);
    };

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleSair);
    }

    handleAddItens = async () => {
        this.handleSpinner(true);
        try {
            let response = await ((this.props.route.params.obrigatorioagenda > 0) ? api.get('/clientes/' + this.props.route.params.usuario) : api.get('/clientes/todos/' + this.props.route.params.usuario));
            let { sucesso, clientes } = response.data;
            if (sucesso) {
                this.setState({ items: clientes });
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
        this.handleSpinner(false);
    }

    handleSair = async () => {
        try {
            await api.get('/usuario/sair');
        } catch (err) {
            console.log(err);
        }
        this.props.navigation.navigate('login');
    };

    handleFinalizarSemColetaPress = () => {
        funcoes.handleConfirm("Mesagem", "Cliente selecionado não possui a coleta?", this.handleFinalizarSemColeta);
    }

    handleFinalizarSemColeta = async () => {
        this.handleSpinner(true);
        this.setState({ coleta: "F" });
        var wBase64 = [];
        wBase64.push({ "base64": "SEMCOLETA" });
        var data = {
            "cliente": this.state.item[0].id,
            "usuario": this.state.usuario,
            "coleta": "F",
            "dthr": new Date(),
            "latitude": this.state.localinicio[0].cordenada.latitude,
            "longitude": this.state.localinicio[0].cordenada.longitude,
            "arquivos": wBase64,
            "veiculo_id": ((this.state.veiculo.length > 0) ? this.state.veiculo[0].key : 0)
        }
        try {
            let response = await api.post('/requisicao', data, { headers: { "Content-Type": "application/json" } });
            let { sucesso } = response.data;
            if (sucesso) {
                funcoes.handleAlert("Mesagem", "Registro salva com sucesso!", this.handleFinaliza);
            } else {
                funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
            }
        } catch (err) {
            console.log(err);
            funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
        }
        this.handleSpinner(false);
    }

    handleFinalizarPress = async () => {
        this.handleSpinner(true);
        this.setState({ coleta: "T" });
        var wBase64 = [];
        this.state.captures.forEach(capture => {
            wBase64.push({ "base64": capture.base64 });
        });
        var data = {
            "cliente": this.state.item[0].id,
            "usuario": this.state.usuario,
            "dthr": new Date(),
            "coleta": "T",
            "latitude": this.state.localinicio[0].cordenada.latitude,
            "longitude": this.state.localinicio[0].cordenada.longitude,
            "arquivos": wBase64,
            "veiculo_id": ((this.state.veiculo.length > 0) ? this.state.veiculo[0].key : 0)
        }
        try {
            let response = await api.post('/requisicao', data, { headers: { "Content-Type": "application/json" } });
            let { sucesso } = response.data;
            if (sucesso) {
                funcoes.handleAlert("Mesagem", "Imagens salva com sucesso!", this.handleFinaliza);
            } else {
                funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
            }
        } catch (err) {
            console.log(err);
            funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
        }
        this.handleSpinner(false);
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
        this.props.navigation.navigate('compartilharrequisicao', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda, cliente: this.state.item[0].id, arquivos: this.state.captures, coleta: this.state.coleta });
    }

    handleVoltarPress = () => {
        this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
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

    handleSetVeiculo = (item) => {
        this.setState({ textInputValue: item.label })
        this.setState({ veiculo: [item] });
    }

    handleSpinner = (valor) => {
        this.setState({ spinner: valor });
    }

    render() {
        const { flashMode, cameraType, capturing, captures, item, spinner } = this.state;
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
        if (this.state.capture === true) {
            return (
                <React.Fragment>
                    <View>
                        <Camera
                            type={cameraType}
                            flashMode={flashMode}
                            style={styles.preview}
                            ref={camera => this.camera = camera} />
                    </View>
                    {captures.length > 0 && <Gallery captures={captures} />}
                    <Toolbar
                        capturing={capturing}
                        flashMode={flashMode}
                        cameraType={cameraType}
                        setFlashMode={this.setFlashMode}
                        setCameraType={this.setCameraType}
                        onCaptureIn={this.handleCaptureIn}
                        onCaptureOut={this.handleCaptureOut}
                        onLongCapture={this.handleLongCapture}
                        onShortCapture={this.handleShortCapture}
                    />
                </React.Fragment>
            );
        }
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
                                selectedItems={this.state.selectedItems}
                                onTextChange={text => (text)}
                                onItemSelect={(item) => this.handleSetItem(item)}
                                containerStyle={styles.ContainerStyle}
                                textInputStyle={styles.TextInputStyle}
                                itemStyle={styles.ItemStyle}
                                itemTextStyle={styles.ItemTextStyle}
                                itemsContainerStyle={styles.ItemsContainerStyle}
                                items={this.state.items}
                                placeholder="selecione o cliente"
                                defaultIndex={this.state.itemIndex}
                                chip={true}
                                resetValue={false}
                                underlineColorAndroid="transparent"
                                width="100%" />
                        </ContainerColumnstretch>
                        <ScrollView >
                            <ContainerColumnstretch>
                                {this.state.hasCameraPermission && <Button style={styles.ButtonLeitor} onPress={() => this.setState({ capture: true })}>
                                    <Text style={styles.ButtonLeitorText}>
                                        <StyledIcon
                                            size={15}
                                            name="barcode" /> Capturar imagem</Text>
                                </Button>}
                            </ContainerColumnstretch>
                            <ContainerColumnstretch>
                                <Button
                                    onPress={this.handleFinalizarSemColetaPress}
                                    style={((item.length > 0) && ((this.state.obrigatorioagenda > 0) || (this.state.veiculo.length > 0))) ? styles.ButtonColetaAtivo : styles.ButtonColetaInativo}
                                    disabled={!((item.length > 0) && ((this.state.obrigatorioagenda > 0) || (this.state.veiculo.length > 0)))}>
                                    <Text style={styles.ButtonText}>Não possui coleta</Text>
                                </Button>
                            </ContainerColumnstretch>
                            <ContainerColumnstretch>
                                <Button
                                    onPress={this.handleFinalizarPress}
                                    style={(((captures.length > 0) && (item.length > 0)) && ((this.state.obrigatorioagenda > 0) || (this.state.veiculo.length > 0))) ? styles.ButtonFinalizarAtivo : styles.ButtonFinalizarInativo}
                                    disabled={!((captures.length > 0) && (item.length > 0) && ((this.state.obrigatorioagenda > 0) || (this.state.veiculo.length > 0)))}>
                                    <Text style={styles.ButtonText}>Finalizar</Text>
                                </Button>
                            </ContainerColumnstretch>

                            <ContainerColumnstretch>
                                <ContainerRowbetween>
                                    <Text >Total Imagens: {captures.length}</Text>
                                </ContainerRowbetween>
                            </ContainerColumnstretch>
                            <ScrollView horizontal={true}>
                                <ContainerColumnstretch>
                                    <ContainerRowbetween>
                                        {captures.map(({ uri }) => (
                                            <View key={uri} style={styles.galleryImageContainer}>
                                                <Image source={{ uri }} style={styles.galleryImage} />
                                            </View>
                                        ))}
                                    </ContainerRowbetween>
                                </ContainerColumnstretch>
                            </ScrollView>
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
    };
};