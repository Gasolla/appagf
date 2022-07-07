import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, FlatList, Dimensions, ScrollView, BackHandler } from 'react-native';
import styles from './styles';
import api from '../../../services/api';
import funcoes from '../../../uses/funcoes';
import { StyledIcon, Button, ContainerRowbetween, ContainerColumnstretch, Label, Container } from './components';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import getDirections from 'react-native-google-maps-directions'
const GOOGLE_MAPS_APIKEY = 'AIzaSyCMeZs26mvBa7A6iUj7-kAUWuMZkVy_Jmw';
const CHAVE_APP = 'APPGRUPOMRS13282814000108'
import Spinner from 'react-native-loading-spinner-overlay';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { BarCodeScanner } from 'expo-barcode-scanner';
import SearchableDropdown from 'react-native-searchable-dropdown';
import * as Location from 'expo-location';

export default class rota extends Component {

  constructor(props) {
    super(props);
    this.mapView = null;
    this._isMounted = false
    this._local = null;
    this.state = {
      usuario: '',
      obrigatorioagenda: 1,
      items: [],
      item: [],
      selectedItems: [],
      itemIndex: 0,
      spinner: true,
      distancia: '',
      duracao: '',
      boovisualizarmaps: false,
      booiniciarota: false,
      permisaolocal: false,
      idrota: 0,
      totalagendamento: 0,
      inicio: [],
      localinicio: [],
      fim: [],
      enderecos: [],
      agendamentos: [],
      rotaAtualizada: [],
      page: 1,
      hasMoreToLoad: true,
      boovisualizaragendamentos: false,
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

  handleonPressLocalizacaoInicial = (data, details) => {
    let obj = {
      descricao: (data.description == null ? data.formatted_address : data.description),
      cordenada: {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
        locationChosen: false
      }
    }
    this.setState({ inicio: [obj] });
    this.setState({ idrota: 0 });
  }

  handleBarCodeScanned = ({ data }) => {
    let linha = data;
    if (linha != CHAVE_APP) {
      funcoes.handleAlert('Mensagem', "Codigo QR Code inválido!", null);
    } else {
      this.setState({ booiniciarota: true });
      this.setState({ boovisualizarmaps: false });
      this.setState({ boovisualizaragendamentos: false });
    }
    this.setState({ scanned: false });
  };


  handleonPressLocalizacaoFinal = (data, details) => {
    let obj = {
      descricao: (data.description == null ? data.formatted_address : data.description),
      cordenada: {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      }
    }
    this.setState({ fim: [obj] });
    this.setState({ idrota: 0 });
  }

  handleRemoveEnderecoFinal = () => {
    this.setState({ fim: [] });
    this.setState({ idrota: 0 });
  }


  handleRemoveEnderecoInicial = () => {
    this.setState({ inicio: [] });
    this.setState({ idrota: 0 });

  }

  handleSetItem = (item) => {
    this.setState({ item: [item] });
    this.setState({ selectedItems: item });
    var ide = this.state.items.findIndex(function (id) {
      if (id.id == item.id)
        return true;
    });
    //console.log(ide);
    this.setState({ itemIndex: ide.toString() });
  };

  handleSpinner = (valor) => {
    this.setState({ spinner: valor });
  }

  handleAddVeiculos = async () => {
    this.handleSpinner(true);
    try {
      let response1 = await api.get('/veiculo/' + this.props.route.params.usuario);
      let { veiculo, sucesso } = response1.data;
      if (sucesso) {
        this.setState({ items: veiculo });
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


  handleAddAgendamento = async () => {
    this.handleSpinner(true);
    try {
      let response1 = await api.get('/rota/' + this.props.route.params.usuario);
      let { id, sucesso } = response1.data;
      if (sucesso) {
        if (id > 0) {
          let response = await api.get(`/rota/index/${id}`);
          //console.log(response.data);
          let { sucesso, rotas } = response.data;
          if (sucesso) {
            await this.getlocalizacao();
            this.setState({ idrota: id });
            let ini = {
              descricao: rotas.rota[0].descinicial,
              cordenada: {
                latitude: Number(rotas.rota[0].latinicial),
                longitude: Number(rotas.rota[0].loginicial),
                latitudeDelta: 0.4,
                longitudeDelta: 0.4,
                locationChosen: false
              }
            }
            let fim = {
              descricao: rotas.rota[0].descfinal,
              cordenada: {
                latitude: Number(rotas.rota[0].latfinal),
                longitude: Number(rotas.rota[0].logfinal),
                latitudeDelta: 0.4,
                longitudeDelta: 0.4,
                locationChosen: false
              }
            }
            rotas.points.forEach(item => {
              item.latitude = Number(item.latitude);
              item.longitude = Number(item.longitude);

            });
            //console.log(rotas.rota[0].veiculo);
            this.setState({ inicio: [ini] });
            this.setState({ fim: [fim] });
            this.setState({ enderecos: rotas.points });
            this.setState({ booiniciarota: true });
            this.setState({ itemIndex: rotas.rota[0].veiculo.toString() });
            this.setState({ item: [this.state.items[rotas.rota[0].veiculo]] });
          } else {
            funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
          }
        } else {
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
          this.setState({ inicio: [obj] });
          this.setState({ fim: [obj] });
          let { page } = this.state;
          let response2 = await api.get(`/agendamento/${this.props.route.params.usuario}?page=${page}`);
          this.setState({ totalagendamento: response2.headers["x-total-count"] });
          let { sucesso, agendamentos } = response2.data;
          if (sucesso) {
            if (agendamentos.length > 0) {
              agendamentos.forEach(item => {
                item.latitude = Number(item.latitude);
                item.longitude = Number(item.longitude);
              });
              this.setState({
                agendamentos: [...this.state.agendamentos, ...agendamentos],
                page: page + 1,
              });
            } else {
              this.setState({ hasMoreToLoad: false })
            }
            await this.handleAddVeiculos();
          } else {
            funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
          }
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
    console.log(obj)
  }

  componentDidMount() {
    this.setState({ usuario: this.props.route.params.usuario });
    this.setState({ obrigatorioagenda: this.props.route.params.obrigatorioagenda });
    this._isMounted = true;
    Dimensions.addEventListener('change', () => this.updateScreen());
    BackHandler.addEventListener("hardwareBackPress", this.handleSair);
    setTimeout(this.handleAddAgendamento, 1000);

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

  handleListaAgendamentos = async () => {
    this.handleSpinner(true);
    const { page } = this.state;
    try {
      let response = await api.get(`/agendamento/${this.props.route.params.usuario}?page=${page}`);
      this.setState({ totalagendamento: response.headers["x-total-count"] });
      let { sucesso, agendamentos } = response.data;
      if (sucesso) {
        if (agendamentos.length > 0) {
          agendamentos.forEach(item => {
            item.latitude = Number(item.latitude);
            item.longitude = Number(item.longitude);
          });
          this.setState({
            agendamentos: [...this.state.agendamentos, ...response.data.agendamentos],
            page: page + 1,
          });
        } else {
          this.setState({ hasMoreToLoad: false })
        }
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

  handleSair = async () => {
    this.handleSpinner(false);
    try {
      await api.get('/usuario/sair');
    } catch (err) {
      console.log(err);
    }
    this.props.navigation.navigate('login');
  };

  handleSelecionarAgendamentos = (item) => {
    this.setState({ enderecos: [...this.state.enderecos, item] });
  }

  handleRemoverAgendamentos = (item) => {
    const obj = this.state.enderecos.filter((childObj) => {
      if (childObj.agendamento_id === item.agendamento_id) {
        return false
      }
      return true
    })
    this.setState({ enderecos: obj });
  }


  onReadyMaps = (result) => {
    this.setState({ distancia: `Distancia: ${result.distance.toFixed(2)} km` })
    this.setState({ duracao: `Duration: ${result.duration.toFixed(2)} min.` })
    let waypoints = [];
    for (var i = 0; result.waypointOrder[0].length > i; i++) {
      if (this.state.enderecos[result.waypointOrder[0][i]].status == "F") {
        waypoints.push(this.state.enderecos[result.waypointOrder[0][i]]);
      }
    }
    this.setState({ rotaAtualizada: waypoints })
    let wArr = [];
    wArr.push('99');
    wArr.push('100');
    this.state.enderecos.map((data, index) => (wArr.push(index.toString())));
    this.mapView.fitToCoordinates(result.coordinates, {
      edgePadding: {
        right: (Dimensions.get('screen').width / 20),
        bottom: (Dimensions.get('screen').height / 20),
        left: (Dimensions.get('screen').width / 20),
        top: (Dimensions.get('screen').height / 20),
      }
    });

    this.mapView.fitToSuppliedMarkers(
      wArr,
      {
        animated: true, // not animated
        edgePadding: {
          right: (Dimensions.get('screen').width / 20),
          bottom: (Dimensions.get('screen').height / 20),
          left: (Dimensions.get('screen').width / 20),
          top: (Dimensions.get('screen').height / 20),
        }
      }
    );
    if ((this.state.idrota === 0) && (this.state.booiniciarota)) {
      this.handleSalvarRotas(result.distance.toFixed(2), result.duration.toFixed(2))
    }
  }

  handleSalvarRotas = async (distancia, duracao) => {
    this.handleSpinner(true);
    var data = {
      "usuario": this.state.usuario,
      "dthr": new Date(),
      "iniciolatitude": this.state.localinicio[0].cordenada.latitude,
      "iniciolongitude": this.state.localinicio[0].cordenada.longitude,
      "veiculo": this.state.item[0].id,
      distancia,
      duracao,
      "latinicial": this.state.inicio[0].cordenada.latitude,
      "loginicial": this.state.inicio[0].cordenada.longitude,
      "descinicial": this.state.inicio[0].descricao,
      "latfinal": this.state.fim[0].cordenada.latitude,
      "logfinal": this.state.fim[0].cordenada.longitude,
      "descfinal": this.state.fim[0].descricao,
      "points": this.state.enderecos
    }
    try {
      let response = await api.post('/rota', data, { headers: { "Content-Type": "application/json" } });
      let { sucesso } = response.data;
      if (sucesso) {
        this.setState({ idrota: response.data.codigo });
      } else {
        funcoes.handleAlert("Mesagem", "Requisição não autorizada!", this.handleSair);
      }
    } catch (err) {
      console.log(err);
      funcoes.handleAlert("Mesagem", "Falha na comunicação! Tente novamente mais tarde!", null);
    }
    this.handleSpinner(false);
  }

  goToInitialLocation = () => {
    let initialRegion = Object.assign({}, this.state.inicio[0].cordenada);
    initialRegion["latitudeDelta"] = 0.005;
    initialRegion["longitudeDelta"] = 0.005;
    this.mapView.animateToRegion(initialRegion, 1000);
  }

  renderAgendamento = ({ item, index }) => (
    <View style={this.state.enderecos.indexOf(item) > -1 ? styles.enderecosselecionado : styles.enderecos}>
      <ContainerColumnstretch>
        <ContainerRowbetween>
          <Text style={{ fontWeight: "bold" }}>Agendamento {(index + 1)}</Text>
          <Button onPress={() => this.state.enderecos.indexOf(item) > -1 ? this.handleRemoverAgendamentos(item) : this.handleSelecionarAgendamentos(item)} style={styles.ButtonTransparentAtivo}>
            <Text style={this.state.enderecos.indexOf(item) > -1 ? styles.ButtonTextErro : styles.ButtonTextSucesso}>{this.state.enderecos.indexOf(item) > -1 ? "Remover" : "Selcionar"}</Text>
          </Button>
        </ContainerRowbetween>
      </ContainerColumnstretch>
      <Text style={styles.enderecosProperty}>Cliente</Text>
      <Text style={styles.enderecosValue}>{item.cliente}</Text>
      <Text style={styles.enderecosProperty}>Endereço inicial</Text>
      <Text style={styles.enderecosValue}>{item.endereco}</Text>
    </View>
  );

  handleGetGoogleMapDirections = () => {
    const data = {
      source: ((this.state.rotaAtualizada.length == this.state.enderecos.length) ? this.state.inicio[0].cordenada : this.state.localinicio[0].cordenada),
      destination: this.state.fim[0].cordenada,
      params: [
        {
          key: "travelmode",
          value: "driving"        // may be "walking", "bicycling" or "transit" as well
        },
        {
          key: "optimizeWaypoints",
          value: true
        },
        {
          key: "dir_action",
          value: "navigate"       // this instantly initializes navigation using the given travel mode
        }
      ],
      waypoints: this.state.rotaAtualizada,
    };
    getDirections(data)
  };

  render() {
    const { scanned, spinner, inicio, fim, boovisualizaragendamentos,
      hasMoreToLoad, agendamentos, totalagendamento, enderecos, screen,
      boovisualizarmaps, booiniciarota, distancia, duracao, item } = this.state;

    const completo = (enderecos.length > 0) &&
      (inicio.length > 0) &&
      (fim.length > 0) &&
      (item.length > 0);

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

    if (boovisualizaragendamentos) {
      return (
        <View style={styles.Principal}>
          {(totalagendamento > 0) &&
            <View style={styles.BoxCabecalho}>
              <Text style={styles.textcabecalho}>Agendamentos: {totalagendamento}</Text>
              <Text style={styles.textcabecalho}>Selecionado: {enderecos.length}</Text>
            </View>}
          {(agendamentos.length === 0) && <View style={styles.Boxmsg}><Text style={styles.textmsg}>Não possui agendamento</Text></View>}
          {(agendamentos.length > 0) && <View style={styles.Box1}>
            <FlatList
              data={agendamentos}
              style={styles.enderecosList}
              keyExtractor={item => String(item.agendamento_id)}
              showsVerticalScrollIndicator={false}
              renderItem={this.renderAgendamento}
              onEndReached={hasMoreToLoad ? this.handleListaAgendamentos : null}
              onEndReachedThreshold={0.1}
            />
          </View>}
          <View style={styles.BoxRodape}>
            <View style={styles.BoxRodapespace}>
              <Button style={styles.ButtonTransparentAtivo}
                onPress={() => { this.setState({ boovisualizaragendamentos: false }); }}>
                <Text style={styles.ButtonTextVoltar}>Voltar</Text>
              </Button>
              <Button style={(completo ? styles.ButtonTransparentAtivo : styles.ButtonTransparentInativo)}
                disabled={!completo}
                onPress={() => {
                  this.setState({ boovisualizaragendamentos: false });
                  this.setState({ booiniciarota: false });
                  this.setState({ boovisualizarmaps: true })
                }}>
                <Text style={styles.ButtonTextSucessolink}>Visualizar</Text>
              </Button>
            </View>
          </View>
        </View>
      )
    }

    if (boovisualizarmaps || booiniciarota) {
      return (
        <View style={styles.container}>
          <MapView
            ref={map => this.mapView = map}
            style={styles.map}
            region={inicio[0].cordenada}
            onMapReady={this.goToInitialLocation.bind()}
            initialRegion={inicio[0].cordenada}
            loadingEnabled={true}
            toolbarEnabled={true}
            optimizeWaypoints={true}
            oomControlEnabled={true}
          >
            {(enderecos.length > 0) && (
              <MapViewDirections
                origin={inicio[0].cordenada}
                waypoints={enderecos}
                destination={fim[0].cordenada}
                apikey={GOOGLE_MAPS_APIKEY}
                strokeWidth={3}
                strokeColor="red"
                optimizeWaypoints={true}
                onStart={(params) => {//console.log(params);
                  //console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                }}
                onReady={result => { this.onReadyMaps(result) }}
                onError={(errorMessage) => { console.log(errorMessage); }}
              />
            )}

            <MapView.Marker key={99} identifier={"99"} coordinate={inicio[0].cordenada} ref={ref => { this.marker = ref; }}>
              <MapView.Callout>
                <Text>Localização Inicial</Text>
              </MapView.Callout>
            </MapView.Marker>
            <MapView.Marker key={100} identifier={"100"} coordinate={fim[0].cordenada} ref={ref => { this.marker = ref; }}>
              <MapView.Callout>
                <Text>Localização Final</Text>
              </MapView.Callout>
            </MapView.Marker>
            {
              enderecos.map((data, index) => (
                <MapView.Marker coordinate={data} key={index} identifier={index.toString()} pinColor={data.status === "T" ? 'green' : "orange"} ref={ref => { this.marker = ref; }}>
                  <MapView.Callout>
                    <Text>{data.cliente}</Text>
                  </MapView.Callout>
                </MapView.Marker>
              ))
            }

          </MapView>
          {(distancia.length > 0) && <View style={styles.enderecos}>
            <Text style={styles.enderecosProperty}>{distancia}</Text>
            <Text style={styles.enderecosProperty}>{duracao}</Text>
          </View>}
          {booiniciarota && <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.buttoniniciarota} onPress={this.handleGetGoogleMapDirections}>
              <Text style={styles.buttonTextiniciarota}>Iniciar Rota</Text>
            </TouchableOpacity>
          </View>}
          {boovisualizarmaps && <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.buttonmedioleft}
              onPress={() => {
                this.setState({ boovisualizaragendamentos: true });
                this.setState({ boovisualizarmaps: false });
                this.setState({ booiniciarota: false })
              }}>
              <Text style={styles.buttonmedioleftText}>Voltar</Text>
            </TouchableOpacity>
          </View>}
          {booiniciarota && <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.buttonmedioright}
              onPress={this.handleVoltarPress}>
              <Text style={styles.buttonmediorightText}>Iniciar Coleta</Text>
            </TouchableOpacity>
          </View>}
        </View>
      );
    }

    return (
      <Container>
        <View style={styles.Principal}>
          <View style={styles.BoxInicial}>
            <ContainerColumnstretch>
              <Label>Selecione o veiculo:</Label>
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
                placeholder="selecione o veiculo"
                defaultIndex={this.state.itemIndex}
                chip={true}
                resetValue={false}
                underlineColorAndroid="transparent"
                width="100%" />
            </ContainerColumnstretch>

            {(inicio.length === 0) && <ContainerColumnstretch>
              <ContainerRowbetween>
                <GooglePlacesAutocomplete
                  placeholder="Localização inicial"
                  minLength={2} // minimum length of text to search
                  autoFocus={false}
                  returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                  listViewDisplayed="auto" // true/false/undefined
                  fetchDetails={true}
                  //renderDescription={row => row.description} // custom description render
                  renderDescription={row => row.description || row.formatted_address || row.name}
                  onPress={(data, details = null) => this.handleonPressLocalizacaoInicial(data, details)}
                  getDefaultValue={() => {
                    return ''; // text input default value
                  }}
                  query={{
                    // available options: https://developers.google.com/places/web-service/autocomplete
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'pt-BR',
                  }}
                  styles={{
                    description: {
                      fontWeight: 'bold',
                    },
                    predefinedPlacesDescription: {
                      color: '#363636',
                    },
                  }}
                  currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                  currentLocationLabel="Minha Localização"
                  nearbyPlacesAPI="GoogleReverseGeocoding" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                  GoogleReverseGeocodingQuery={{
                    // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'pt-BR',
                  }}
                  GooglePlacesSearchQuery={{
                    // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                    rankby: 'distance',
                    types: 'food',
                  }}

                  // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                  debounce={200}
                />
              </ContainerRowbetween>
            </ContainerColumnstretch>}
            {(fim.length === 0) && <ContainerColumnstretch>
              <ContainerRowbetween>
                <GooglePlacesAutocomplete
                  placeholder="Localização final"
                  minLength={2} // minimum length of text to search
                  autoFocus={false}
                  returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                  listViewDisplayed="auto" // true/false/undefined
                  fetchDetails={true}
                  //renderDescription={row => row.description} // custom description render
                  renderDescription={row => row.description || row.formatted_address || row.name}
                  onPress={(data, details = null) => this.handleonPressLocalizacaoFinal(data, details)}
                  getDefaultValue={() => {
                    return ''; // text input default value
                  }}
                  query={{
                    // available options: https://developers.google.com/places/web-service/autocomplete
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'pt-BR',
                  }}
                  styles={{
                    description: {
                      fontWeight: 'bold',
                    },
                    predefinedPlacesDescription: {
                      color: '#363636',
                    },
                  }}
                  currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                  currentLocationLabel="Minha Localização"
                  nearbyPlacesAPI="GoogleReverseGeocoding" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                  GoogleReverseGeocodingQuery={{
                    // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'pt-BR',
                  }}
                  GooglePlacesSearchQuery={{
                    // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                    rankby: 'distance',
                    types: 'food',
                  }}

                  // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
                  debounce={200}
                />
              </ContainerRowbetween>
            </ContainerColumnstretch>}
            <ScrollView >
              {(inicio.length > 0) && <View style={styles.enderecos}>
                <ContainerColumnstretch>
                  <ContainerRowbetween>
                    <Text style={styles.enderecosProperty}>Endereço Inicial</Text>
                    <Button onPress={() => this.handleRemoveEnderecoInicial()} style={styles.ButtonRemoveCliente}>
                      <Text style={styles.ButtonRemoveClienteText}>
                        <StyledIcon
                          size={15}
                          name="close" />
                      </Text>
                    </Button>
                  </ContainerRowbetween>
                </ContainerColumnstretch>
                <Text style={styles.enderecosValue}>{inicio[0].descricao}</Text>
              </View>}
              {(fim.length > 0) && <View style={styles.enderecos}>
                <ContainerColumnstretch>
                  <ContainerRowbetween>
                    <Text style={styles.enderecosProperty}>Endereço Final</Text>
                    <Button onPress={() => this.handleRemoveEnderecoFinal()} style={styles.ButtonRemoveCliente}>
                      <Text style={styles.ButtonRemoveClienteText}>
                        <StyledIcon
                          size={15}
                          name="close" />
                      </Text>
                    </Button>
                  </ContainerRowbetween>
                </ContainerColumnstretch>
                <Text style={styles.enderecosValue}>{fim[0].descricao}</Text>
              </View>}

              <ContainerColumnstretch>
                <Button
                  disabled={false}
                  style={styles.ButtonSelecionarClienteAtivo}
                  onPress={() => { this.setState({ boovisualizaragendamentos: true }) }}>
                  <Text style={styles.ButtonTextSelecionarcliente}>Visualizar agendamentos</Text>
                </Button>
              </ContainerColumnstretch>
              <ContainerColumnstretch>
                <Button
                  disabled={!completo}
                  style={completo ? styles.ButtonFinalizarAtivo : styles.ButtonFinalizarInativo}
                  onPress={() => {
                    this.setState({ scanned: true });
                    //this.setState({ booiniciarota: true });
                    //this.setState({ boovisualizarmaps: false });
                    //this.setState({ boovisualizaragendamentos: false });
                  }}>
                  <Text style={styles.ButtonTextSelecionarcliente}>Iniciar rota</Text>
                </Button>
              </ContainerColumnstretch>
            </ScrollView >
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
    )


  }

}