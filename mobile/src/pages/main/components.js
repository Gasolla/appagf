import styled from 'styled-components';
import Icon from 'react-native-vector-icons/FontAwesome';

const Container = styled.View`
  flex: 1;
  padding: 20px;
  backgroundColor: #F5F5F5;
  
`;

const Button = styled.TouchableHighlight`
  padding: 15px;
  borderRadius: 7px;
  backgroundColor: #363636;
  alignSelf: stretch;
  margin: 10px;
  marginHorizontal: 10px;
  width: 95%
`;

const BtnContainer = styled.View`
	flexDirection: row;
	justifyContent: space-between;
	margin: 0 0px;	
`;

const ButtonText = styled.Text`
  color: #FFF;
  fontWeight: bold;
  fontSize: 20px;
  textAlign: center;
`;

const StyledIcon = styled(Icon)`
  color: #FFF; 
  fontWeight: bold;
  fontSize: 22px; 
`;

const ContainerRowbetween = styled.View`
	flexDirection: row;
	justifyContent: space-between;
  margin: 2px;
`;


const ContainerColumnstretch = styled.View`
	flexDirection: column;
  alignItems: stretch;
  margin: 5px;
`;

export { Container, Button, ButtonText, StyledIcon, BtnContainer, ContainerColumnstretch, ContainerRowbetween};