import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage
} from 'react-native';
import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import Button from './components/Button';
import Input from './components/Input';

const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch });

export default class App extends React.Component {
  state = {
    accountName: '',
    loggedIn: false,
    transactions: '',
  }

  onInputChange = (key, value) => {
    this.setState(prevState => ({
      ...prevState,
      [key]: value
    }))
  }

  retrieveItem = async (key) => {
    try {
      const retrievedItem =  await AsyncStorage.getItem(key);
      const item = JSON.parse(retrievedItem);
      return item;
    } catch (error) {
      console.log(error.message);
    }
    return
  }

  storeItem = async (key, store) => {
    try {
      const storage = await AsyncStorage.setItem(key, store);
      return storage
    } catch (err) {
      console.log(err.message)
    }
  };

  removeItem = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch(exception) {
      return false;
    }
  }

  triggerStoreKey = async () => {
    await this.storeItem("ACCOUNT_NAME", JSON.stringify(this.state.accountName));
    const resp = await rpc.history_get_actions(
        this.state.accountName         // Account that owns the data
    );
    console.log(resp)
    this.setState({
      loggedIn: true,
      transactions: resp.actions
    });
  }

  triggerRemoveKey = async () => {
    let success = this.removeItem("ACCOUNT_NAME");
    if (success) {
      this.setState({
        loggedIn: false,
        accountName: '',
        transactions: ''
      })
    }
  }

  async componentDidMount() {
    try {
      let accountName = await this.retrieveItem("ACCOUNT_NAME");
      console.log(accountName);
      if (accountName != '' && accountName != null) {
        const resp = await rpc.history_get_actions(
            accountName         // Account that owns the data
        );
        console.log(resp)
        this.setState({
          loggedIn: true,
          transactions: resp.actions,
          accountName: accountName
        });
      }
    } catch (error) {
      console.log('Promise is rejected with error: ' + error);
    }
  }

  render() {
    console.log(this.state);
    return (
      <View style={styles.container}>
        <Text style = {{fontSize: 20, marginBottom: 20, fontWeight: '600'}}>
          EOS History
        </Text>
        { this.state.loggedIn ? (
          <View>
            <Text style = {{fontWeight: '900'}}>Past transactions for {this.state.accountName}</Text>
            {Object.keys(this.state.transactions).map(key => {
              if (this.state.transactions[key].action_trace.act.account === "eosio.token") {
                return(
                  <View key={key} style = {{display:'flex', flexDirection: 'row'}}>
                    <Text>From: {this.state.transactions[key].action_trace.act.data.from} </Text>
                    <Text>To: {this.state.transactions[key].action_trace.act.data.to} </Text>
                    <Text> {this.state.transactions[key].action_trace.act.data.quantity} </Text>
                    <Text>Memo: {this.state.transactions[key].action_trace.act.data.memo}</Text>
                  </View>
                )
              }
            })}
            <Button
              title='Remove Account'
              onPress={this.triggerRemoveKey}
             />
          </View>
        ) : (
          <View>
            <Input
              placeholder="Enter EOS Account Name"
              type='accountName'
              name='accountName'
              onChangeText={this.onInputChange}
              value={this.state.accountName}
            />
            <Button
              title='Load Account'
              onPress={this.triggerStoreKey}
             />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  image: {
    width: 100,
    height: 120,
  },
  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});
