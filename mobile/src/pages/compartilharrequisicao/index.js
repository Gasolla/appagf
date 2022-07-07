import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, Text, Image, BackHandler } from 'react-native';
import styles from './styles';
import api from '../../../services/api';
import funcoes from '../../../uses/funcoes';
import moment from "moment";
import { Container, Button, ContainerRowbetween, ContainerColumnstretch, } from './components';

export default class remessa extends Component {
    

    constructor(props) {
        super(props);
        this.state = {
            usuario: '',
            obrigatorioagenda: 1,
            captures: [],
            btnemail: false,
            btnwhats: false,
            coleta: true,
            clienteid: 0,
            cliente: '',
            data: moment(new Date()).format("DD/MM/YYYY"),
            email: "",
            telefone: "",
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
        this.setState({ clienteid: this.props.route.params.cliente });
        this.setState({ captures: this.props.route.params.arquivos });
        this.setState({ coleta: (this.props.route.params.coleta === "T") });
        BackHandler.addEventListener("hardwareBackPress", this.handleSair);
        setTimeout(this.handleAddItens, 1000);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleSair);
    }

    handleVoltarPress = () => {
        this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda });
    };

    handleSair = async () => {
        try {
            await api.get('/usuario/sair');
        } catch (err) {
            console.log(err);
        }
        this.props.navigation.navigate('login');
    };


    handleAddItens = async () => {
        try {
            let response = await api.get('/clientes/index/' + this.props.route.params.cliente);
            let { sucesso, clientes } = response.data;
            if (sucesso) {
                this.setState({ email: clientes[0].email });
                this.setState({ telefone: '55' + clientes[0].numerofone });
                this.setState({ cliente: clientes[0].nome });
                this.setState({ btnemail: (clientes[0].email !== '') });
                this.setState({ btnwhats: (clientes[0].telefone !== '') });
            } else {
                funcoes.handleAlert("Mesagem", "Falha na autorização do servidor!", this.handleSair);
            }
        } catch (err) {
            console.log(err);
            funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
        }
    }

    handleEmailPress = () => {
        let msg = funcoes.getSaudacao() + ",\n" + this.state.cliente + "\n";
        let index = 0;
        if (this.state.coleta) {
            msg += "Segue as requisições coletada na data de " + this.state.data + "\n\n";
            var anexo = [];
            this.state.captures.forEach(captures => {
                index++;
                anexo.push(captures.uri);
            });

            msg += "\nTotal de requisições: " + index;
            funcoes.sendEmailAnexo(this.state.email, "Coletor Correios", msg, anexo);
        } else {
            msg += "Não houve coleta na data de " + this.state.data + "\n\n";
            funcoes.sendEmail(this.state.email, "Coletor Correios", msg);
        }
        //
    }

    handleWhatsPress = () => {
        let msg = funcoes.getSaudacao() + ",\n" + this.state.cliente + "\n";
        let index = 0;
        if (this.state.coleta) {
            msg += "Segue as requisições coletada na data de " + this.state.data + "\n\n";
            var url;
            this.state.captures.forEach(capture => {
                index++;
                url = capture.uri;
            });
            funcoes.sendWhatsAppShare(url);
        } else {
            msg += "Não houve coleta na data de " + this.state.data + "\n\n";
            funcoes.sendWhatsApp(msg, this.state.telefone)
        }

    }



    render() {

        const { btnwhats, btnemail, cliente, email, telefone, data, captures, coleta } = this.state;
        return (

            <Container>
                <View style={styles.Principal}>
                    <View style={styles.BoxInicial}>

                        <ScrollView >
                            <ContainerColumnstretch>
                                <ContainerRowbetween>
                                    <Button
                                        style={btnemail ? styles.ButtonEmailAtivo : styles.ButtonEmailInativo}
                                        onPress={this.handleEmailPress}
                                        disabled={(!btnemail)}>
                                        <Text style={styles.ButtonText}>Enviar por e-mail</Text>
                                    </Button>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Button
                                        style={btnwhats ? styles.ButtonWhatsAtivo : styles.ButtonWhatsInativo}
                                        onPress={this.handleWhatsPress}
                                        disabled={(!btnwhats)}>
                                        <Text style={styles.ButtonText}>Enviar por whatsapp</Text>
                                    </Button>
                                </ContainerRowbetween>

                            </ContainerColumnstretch>

                            <View style={styles.tituloResultado}>
                                <Text style={styles.tituloResultadotexto}>Relatório de coleta</Text>
                            </View>
                            <ContainerColumnstretch>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Cliente:</Text>
                                    <Text style={styles.resultadotexto}>{cliente}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Email:</Text>
                                    <Text style={styles.resultadotexto}>{email}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Telefone:</Text>
                                    <Text style={styles.resultadotexto}>{telefone}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Data Coleta:</Text>
                                    <Text style={styles.resultadotexto}>{data}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Quantidade:</Text>
                                    <Text style={styles.resultadotexto}>{captures.length}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Segue abaixo a lista da imagens:</Text>
                                </ContainerRowbetween>
                            </ContainerColumnstretch>
                            {coleta && <ScrollView horizontal={true}>
                                <ContainerColumnstretch>
                                    <ContainerRowbetween>
                                        {captures.map(({ uri }) => (
                                            <View key={uri} style={styles.galleryImageContainer}>
                                                <Image source={{ uri }} style={styles.galleryImage} />
                                            </View>
                                        ))}
                                    </ContainerRowbetween>
                                </ContainerColumnstretch>
                            </ScrollView>}
                            {(!coleta) && <View style={styles.Boxmsg}><Text style={styles.textmsg}>Não possui coleta.</Text></View>}

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