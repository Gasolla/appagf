import React from 'react';
import PropTypes from 'prop-types';
import { Camera } from 'expo-camera';
import { View, Text, ScrollView, Image, BackHandler } from 'react-native';
import api from '../../../services/api';
import funcoes from '../../../uses/funcoes';
import styles from './styles';
import Toolbar from './toolbar.component';
import Gallery from './gallery.component';
import { Container, StyledIcon, Button, ContainerRowbetween, ContainerColumnstretch } from './components';
import Spinner from 'react-native-loading-spinner-overlay';

export default class trocaoleo extends React.Component {
    camera = null;
    state = {
        usuario: '',
        obrigatorioagenda: 1,
        captures: [],
        capturing: null,
        spinner: false,
        cameraType: Camera.Constants.Type.back,
        flashMode: Camera.Constants.FlashMode.off,
        capture: false,
    };

    constructor(props) {
        super(props);
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

    componentDidMount() {
        this.setState({ usuario: this.props.route.params.usuario });
        this.setState({obrigatorioagenda: this.props.route.params.obrigatorioagenda});
        BackHandler.addEventListener("hardwareBackPress", this.handleSair);     
    };


    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleSair);
    }

    handleSair = async () => {
        try {
            await api.get('/usuario/sair');
        } catch (err) {
            console.log(err);
        }
        this.props.navigation.navigate('login');
    };

    
    handleFinalizarPress = async () => {
        this.handleSpinner(true);
        var wBase64;
        this.state.captures.forEach(capture => {
            wBase64 = capture.base64;
        });
        var data = {
            "usuario": this.state.usuario,
            "dthr": new Date(),
            "base64": wBase64
        }
        try {
            let response = await api.post('/trocaoleo', data, { headers: { "Content-Type": "application/json" } });
            let { sucesso } = response.data;
            if (sucesso) {
                funcoes.handleAlert("Mesagem", "Troca de óleo salva com sucesso!", this.handleVoltarPress);
            } else {
                funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
            }
        } catch (err) {
            console.log(err);
            funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
        }
        this.handleSpinner(false);
    }

    handleVoltarPress = () => {
        this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
    };

    
    handleSpinner = (valor) => {
        this.setState({ spinner: valor });
    }

    render() {
        const { flashMode, cameraType, capturing, captures, spinner } = this.state;
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
                        <ScrollView >
                            <ContainerColumnstretch>
                                <Button disabled={captures.length > 0}
                                        style={(captures.length > 0?styles.ButtonLeitorinativo:styles.ButtonLeitor)} 
                                        onPress={() => this.setState({ capture: true })}>
                                    <Text style={styles.ButtonLeitorText}>
                                        <StyledIcon
                                            size={15}
                                            name="barcode" /> Capturar imagem</Text>
                                </Button>
                            </ContainerColumnstretch>
                            <ContainerColumnstretch>
                                <Button
                                    onPress={this.handleFinalizarPress}
                                    style={((captures.length > 0)) ? styles.ButtonFinalizarAtivo : styles.ButtonFinalizarInativo}
                                    disabled={!((captures.length > 0))}>
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
                                    onPress={this.handleSair}>
                                    <Text style={styles.ButtonTextVoltar}>Cancelar</Text>
                                </Button>
                            </ContainerColumnstretch>
                        </View>
                    </View>
                </View>
            </Container>
        );
    };
};