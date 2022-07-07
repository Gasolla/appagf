import React from 'react';
import { View, Text } from 'react-native';
import { Button, ContainerRowbetween, ContainerColumnstretch } from './components';
import styles from './styles';

renderRotas = ({ item, index }) => (
    <View style={styles.enderecos}>
      <ContainerColumnstretch>
        <ContainerRowbetween>
          <Button onPress={() => this.handleSelecionar(item)} style={styles.ButtonTransparentAtivo}>
            <Text style={styles.ButtonTextSucesso}>Selcionar</Text>
          </Button>
        </ContainerRowbetween>
      </ContainerColumnstretch>
      <Text style={styles.enderecosProperty}>Cliente</Text>
      <Text style={styles.enderecosValue}>{item.cliente}</Text>
      <Text style={styles.enderecosProperty}>Endereço inicial</Text>
      <Text style={styles.enderecosValue}>{item.endereco}</Text>
    </View>
  );

  export default renderRotas;