import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AsyncStorage, ScrollView, View } from 'react-native';
import api from '../../../services/api';
import { Container, Logo, Input, ErrorMessage, Button, ButtonText, } from './components';
import styles from './styles';
import Spinner from 'react-native-loading-spinner-overlay';

export default class login extends Component {
  //Esse trecho indica que nesse componente é necessário a passagem de um objeto navigation que contenha as funções navigate e dispatch.
  state = {
    usuario: '',
    password: '',
    error: '',
    spinner: false,
  };

  constructor(props) {
    super(props);

  }


  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    }).isRequired,
  };


  handleUsuarioChange = (usuario) => {
    this.setState({ usuario });
  };

  handlePasswordChange = (password) => {
    this.setState({ password });
  };

  handleSignInPress = async () => {
    this.setState({spinner : true});
    if (this.state.usuario.length === 0 || this.state.password.length === 0) {
      this.setState({ error: 'Preencha usuário e senha para continuar 1!' }, () => false);
    } else {
      try {
        //console.log('aqui');
        //console.log(api);
        let response = await api.post('/usuario/login', {
          usuario: this.state.usuario,
          password: this.state.password
        }, { headers: { "Content-Type": "application/json" } });
        let {auth, token, id, obrigatorioagenda, message} = response.data;
        if (auth) {
          console.log(obrigatorioagenda);
          await AsyncStorage.setItem('@MRSApp:token', token);
          this.setState({ error: '' });
          this.props.navigation.navigate('main', { usuario: id, obrigatorioagenda: obrigatorioagenda });
        } else {
          this.setState({ error: message });
        }

      } catch (err) {
        console.log(err);
        this.setState({ error: 'Houve um problema com o login, verifique suas credenciais!' });
      }
    }
    this.setState({spinner : false});
  };

  render() {
    const {spinner} = this.state;

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
    return (
      <ScrollView contentContainerStyle={styles.ContainerScroll}>
        <Container>
          <Logo source={require('../../../assets/mr.jpg')} resizeMode="contain" />
          <Input
            placeholder="Usuário"
            value={this.state.usuario}
            onChangeText={this.handleUsuarioChange}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            placeholder="Senha"
            value={this.state.password}
            onChangeText={this.handlePasswordChange}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          {this.state.error.length !== 0 && <ErrorMessage>{this.state.error}</ErrorMessage>}
          <Button onPress={this.handleSignInPress}>
            <ButtonText>Entrar</ButtonText>
          </Button>
        </Container>
      </ScrollView>
    );
  }
}