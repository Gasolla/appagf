import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, FlatList, Dimensions, BackHandler } from 'react-native';
import styles from './styles';
import api from '../../../services/api';
import funcoes from '../../../uses/funcoes';
import { StyledIcon, Button, ContainerRowbetween, ContainerColumnstretch } from './components';
const CHAVE_APP = 'APPGRUPOMRS13282814000108'
import Spinner from 'react-native-loading-spinner-overlay';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Location from 'expo-location';

export default class rotafinalizar extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this._local = null;
        this.state = {
            usuario: '',
            obrigatorioagenda: 1,
            spinner: true,
            permisaolocal: false,
            idrota: 0,
            rotas: [],
            localinicio: [],
            hasMoreToLoad: true,
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

    static navigationOptions = {
        header: null
    };


    handleBarCodeScanned = ({ data }) => {
        let linha = data;
        if (linha != CHAVE_APP) {
            funcoes.handleAlert('Mensagem', "Codigo QR Code inválido!", null);
        } else {
            this.handlfinalizar(this.state.idrota);
        }
        this.setState({ scanned: false });
    };

    handleSpinner = (valor) => {
        this.setState({ spinner: valor });
    }

    handleSpinnerFalse = () => {
        this.handleSpinner(false);
    }


    handleAddRota = async () => {
        this.handleSpinner(true);
        try {
            let response = await api.get('/rotafinalizar/' + this.props.route.params.usuario);
            let { sucesso } = response.data;
            if (sucesso) {
                this.setState({ rotas: response.data.rotas });
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
            if (this._local != null){
                this._local.remove();
            }
        } catch (e) {
            if (this._local != null){
                this._local.remove();
            }
            console.log(e)
            this.getLocalizacaoDefault();
        }
    }


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
                    this.getLocalizacaoDefault();
                }
        } catch (e) {
            console.log(e)
            this.getLocalizacaoDefault();
        }

    }

    getLocalizacaoDefault = () => {
        let obj = {
            descricao: "Avenida Afrânio Rodrigues da Cunha, 50 - Tabajaras, Uberlândia - MG, Brasil",
            cordenada: {
                latitude: -18.9239133,
                longitude: -48.28732660000001,
                locationChosen: false,
                latitudeDelta: 0.4,
                longitudeDelta: 0.4
            }
        }
        this.setState({ localinicio: [obj] });
    }

    componentDidMount() {
        this.setState({ usuario: this.props.route.params.usuario })
        this.setState({ obrigatorioagenda: this.props.route.params.obrigatorioagenda });
        this._isMounted = true;
        Dimensions.addEventListener('change', () => this.updateScreen());
        BackHandler.addEventListener("hardwareBackPress", this.handleSair);
        setTimeout(this.handleAddRota, 1000);
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

    handlefinalizarpress = (id) => {
        this.handleSpinner(true);
        this.setState({ idrota: id });
        this.setState({ scanned: true });
        this.handleSpinner(false);
        //this.handlfinalizar(id)
    }

    handlfinalizar = async (id) => {
        this.handleSpinner(true);
        let data = {
            usuario: this.state.usuario,
            rota: id,
            fimlatitude: this.state.localinicio[0].cordenada.latitude,
            fimlongitude: this.state.localinicio[0].cordenada.longitude
        }
        try {
            let response = await api.post('/rotafinalizar', data, { headers: { "Content-Type": "application/json" } });
            let { sucesso } = response.data;
            if (sucesso) {
                this.handleAddRota();
            } else {
                funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
            }
        } catch (err) {
            console.log(err);
            funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
        }
        this.handleSpinner(false);
    }

    renderRota = ({ item, index }) => (
        <View style={styles.enderecos}>
            <ContainerColumnstretch>
                <ContainerRowbetween>
                    <Text style={{ fontWeight: "bold" }}>Rota {(index + 1)}</Text>
                </ContainerRowbetween>
            </ContainerColumnstretch>
            <ContainerColumnstretch>
                <ContainerRowbetween>
                    <Text style={styles.enderecosProperty}>Data hora:</Text>
                    <Text style={styles.enderecosValue}>{item.data}</Text>
                </ContainerRowbetween>
                <ContainerRowbetween>
                    <Text style={styles.enderecosProperty}>Quatidade Coleta:</Text>
                    <Text style={styles.enderecosValue}>{item.total}</Text>
                </ContainerRowbetween>

            </ContainerColumnstretch>
            <ContainerColumnstretch>
                <Button
                    disabled={false}
                    style={styles.ButtonFinalizar}
                    onPress={() => this.handlefinalizarpress(item.id)}>
                    <Text style={styles.ButtonText}>Finalizar rota</Text>
                </Button>
            </ContainerColumnstretch>

        </View>
    );


    render() {
        const { spinner, scanned, rotas, screen } = this.state;


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
                                    name="barcode" /> Cancelar leitor de QR Code</Text>
                        </Button>
                    </ContainerColumnstretch>
                </View>
            );
        }

        return (
            <View style={styles.Principal}>
                {(rotas.length > 0) &&
                    <View style={styles.BoxCabecalho}>
                        <Text style={styles.textcabecalho}>Rota em aberto: {rotas.length}</Text>
                    </View>}
                {(rotas.length === 0) && <View style={styles.Boxmsg}><Text style={styles.textmsg}>Não possui rota para finalizar.</Text></View>}
                {(rotas.length > 0) && <View style={styles.Box1}>
                    <FlatList
                        data={rotas}
                        style={styles.enderecosList}
                        keyExtractor={item => String(item.id)}
                        showsVerticalScrollIndicator={false}
                        renderItem={this.renderRota}
                    //onEndReached={hasMoreToLoad ? this.handleListaAgendamentos : null}
                    //onEndReachedThreshold={0.1}
                    />
                </View>}
                <View style={styles.BoxRodape}>
                    <ContainerColumnstretch>
                        <Button style={styles.ButtonVoltar}
                            onPress={this.handleVoltarPress}>
                            <Text style={styles.ButtonTextVoltar}>Voltar ao menu principal</Text>
                        </Button>
                    </ContainerColumnstretch>
                </View>
            </View>
        )

    }

}