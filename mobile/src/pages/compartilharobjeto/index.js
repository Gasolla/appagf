import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, Text, BackHandler } from 'react-native';
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
            objetos: [],
            btnemail: false,
            btnwhats: false,
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
        this.setState({ usuario: this.props.route.params.usuario })
        this.setState({obrigatorioagenda: this.props.route.params.obrigatorioagenda});
		this.setState({ clienteid: this.props.route.params.cliente });
        this.setState({ objetos: this.props.route.params.objetos });
        BackHandler.addEventListener("hardwareBackPress", this.handleSair);
        setTimeout(this.handleAddItens, 1000);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.handleSair);
    }

    handleVoltarPress = () => {
        this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda  });
    };

    handleVoltarPress = () => {
        this.props.navigation.navigate('main', { usuario: this.state.usuario, obrigatorioagenda: this.state.obrigatorioagenda  });
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
                funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
            }
        } catch (err) {
            console.log(err);
            funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
        }
    }

    handleEmailPress = () => {
        let msg = funcoes.getSaudacao() + ",\n" + this.state.cliente + "\n";
        let index = 0;
        msg += "Segue a lista dos objetos coletado na data de " + this.state.data + "\n\n";

        this.state.objetos.forEach(item => {
            index++;
            msg += (index) + ": " + item.objeto + "\n";
        });

        msg += "\nTotal da coleta: " + index;
        funcoes.sendEmail(this.state.email, "Coletor Correios", msg);
        //
    }

    handleWhatsPress = () => {
        let msg = funcoes.getSaudacao() + ",\n" + this.state.cliente + "\n";
        let index = 0;
        msg += "Segue a lista dos objetos coletado na data de " + this.state.data + "\n\n";

        this.state.objetos.forEach(item => {
            index++;
            msg += (index) + ": " + item.objeto + "\n";
        });

        msg += "\nTotal da coleta: " + index;
        funcoes.sendWhatsApp(msg, this.state.telefone)
    }

    render() {
        return (

            <Container>
                <View style={styles.Principal}>
                    <View style={styles.BoxInicial}>

                        <ScrollView >
                            <ContainerColumnstretch>
                                <ContainerRowbetween>
                                    <Button
                                        style={this.state.btnemail ? styles.ButtonEmailAtivo : styles.ButtonEmailInativo}
                                        onPress={this.handleEmailPress}
                                        disabled={(!this.state.btnemail)}>
                                        <Text style={styles.ButtonText}>Enviar por e-mail</Text>
                                    </Button>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Button
                                        style={this.state.btnwhats ? styles.ButtonWhatsAtivo : styles.ButtonWhatsInativo}
                                        onPress={this.handleWhatsPress}
                                        disabled={(!this.state.btnwhats)}>
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
                                    <Text style={styles.resultadotexto}>{this.state.cliente}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Email:</Text>
                                    <Text style={styles.resultadotexto}>{this.state.email}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Telefone:</Text>
                                    <Text style={styles.resultadotexto}>{this.state.telefone}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Data Coleta:</Text>
                                    <Text style={styles.resultadotexto}>{this.state.data}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Quantidade:</Text>
                                    <Text style={styles.resultadotexto}>{this.state.objetos.length}</Text>
                                </ContainerRowbetween>
                                <ContainerRowbetween>
                                    <Text style={styles.titulotexto}>Segue abaixo a lista do objetos:</Text>
                                </ContainerRowbetween>
                                {
                                    this.state.objetos.map((objeto, index) => (
                                        <View key={index} style={styles.containerlist}>
                                            <Text style={styles.titulotexto}>{(index + 1)}:</Text>
                                            <Text style={styles.resultadotexto}>{objeto.objeto}</Text>
                                        </View>
                                    ))
                                }
                            </ContainerColumnstretch>
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