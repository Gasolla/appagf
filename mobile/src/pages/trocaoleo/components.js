import styled from 'styled-components';
import Icon from 'react-native-vector-icons/FontAwesome';

const Container = styled.View`
  flex: 1;
  margin: 10px 0;
  backgroundColor: #F5F5F5;
  padding: 5px; 20px
`;

const StyledIcon = styled(Icon)`
  color: #FFF; 
  fontWeight: bold;
`;

const Button = styled.TouchableOpacity`
  borderRadius: 5px;
  alignItems: center;
  justifyContent: center;
`;

const ContainerRowbetween = styled.View`
	flexDirection: row;
	justifyContent: space-between;
  margin: 2px;
`;

const Input = styled.TextInput`
  paddingHorizontal: 5px;
  paddingVertical: 5px;
  borderRadius: 5px;
  backgroundColor: #FFF;
  fontSize: 16px;
  height: 40px;
`;

const ContainerColumnstretch = styled.View`
	flexDirection: column;
  alignItems: stretch;
  margin: 5px;
`;

const Label= styled.Text`
	color: #4F4F4F;
	fontWeight: bold;
	fontSize: 15px;
	marginLeft: 5px;
`;

export { Container, StyledIcon, Button, ContainerRowbetween, Input, ContainerColumnstretch, Label};