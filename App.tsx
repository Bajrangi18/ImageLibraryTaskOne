import { SafeAreaView,Dimensions,View,Pressable,Text,Animated,ActivityIndicator } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './Components/HomePage';
import SearchPage from './Components/SearchPage';
import { useEffect, useState,useRef } from 'react';
import NetInfo,{useNetInfo} from '@react-native-community/netinfo';

const Drawer = createDrawerNavigator();

const App = () => {
    const netHolder = useNetInfo().isConnected
    const [showHead,setShowHead] = useState(true)
    const headerVal = useRef(new Animated.Value(56)).current
    const headerOpa = useRef(new Animated.Value(1)).current
    const [testing,setTesting] = useState(false)
    const [testTry,setTestTry] = useState(true)
    useEffect(()=>{
      Animated.parallel([
        Animated.timing(headerVal,{
          duration:200,
          useNativeDriver:false,
          toValue:showHead?56:0,
        }),
        Animated.timing(headerOpa,{
          duration:200,
          useNativeDriver:false,
          toValue:showHead?1:0,
        })
      ]).start()
    },[showHead])

    useEffect(()=>{
      if(netHolder!=null){
        if(!netHolder){
          setTestTry(false)
          snackBarVisibility()
        }
      }
      
    },[netHolder])

    const snackBar = useRef(new Animated.Value(0)).current
    const snackBarIndex = useRef(new Animated.Value(-1)).current
    const snackBarVisibility = () => {
      Animated.parallel([
        Animated.timing(snackBar,{
          toValue:netHolder?0:1,
          duration:netHolder?3000:100,
          useNativeDriver:false
        }),
        Animated.timing(snackBarIndex,{
          toValue:netHolder?-1:10,
          duration:netHolder?3000:100,
          useNativeDriver:false
        })
      ])
      .start()
    }
    return(
    <SafeAreaView style={{height:Dimensions.get("window").height,width:Dimensions.get("window").width}}>
      <Animated.View style={[{bottom:25,width:"100%",alignItems:'center',position:'absolute',elevation:10,opacity:snackBar,zIndex:snackBarIndex}]}>
      {!testTry?<View style={{width:"90%",justifyContent:'center',alignItems:'center',height:48,flexDirection:'row',backgroundColor:"#fffefe",borderRadius:5}}>
        <Text style={{fontSize:15,color:"black",fontWeight:"500",flex:5,paddingLeft:20}}>{!testing?"Network Failure":"Connecting"}</Text>
        {!testing?<Pressable onPress={()=>{
          setTesting(true)
          NetInfo.refresh().then(state => {
            if(state.isConnected){
              setTestTry(true)
              setTesting(false)
              snackBarVisibility()
            }else{
              setTesting(false)
            }
          });
        }} 
        style={{justifyContent:'center',alignItems:'center',flex:2}}>
          <Text style={{fontSize:15,color:"#3c31b9",fontWeight:"900"}}>RETRY</Text>
        </Pressable>:<ActivityIndicator size="large" color="black" style={{flex:2}}/>}
      </View>:
      <View style={{width:"90%",justifyContent:'center',alignItems:'center',height:48,flexDirection:'row',backgroundColor:"#fffefe",borderRadius:5}}>
      <Text style={{fontSize:15,color:"black",fontWeight:"500"}}>Connected!</Text></View>}
      </Animated.View>
    <NavigationContainer>
          <Drawer.Navigator initialRouteName="Home" screenOptions={{drawerStyle:{backgroundColor:'#181818'},drawerActiveTintColor:'white',drawerActiveBackgroundColor:'rgba(255,255,255,0.25)',drawerInactiveTintColor:"rgba(255,255,255,0.7)",drawerInactiveBackgroundColor:'rgba(255,255,255,0.1)'}}  >
            <Drawer.Screen  name="Home" options={{headerStyle:{backgroundColor:'black',height:headerVal,opacity:headerOpa},headerTintColor:'white'}}>
              {props => <HomePage {...props} setShowHead={setShowHead} testTry={testTry}/> }
            </Drawer.Screen>
            <Drawer.Screen  name="Search" options={{headerStyle:{backgroundColor:'black',height:headerVal,opacity:headerOpa},headerTintColor:'white'}}>
              {props => <SearchPage {...props} setShowHead={setShowHead} netHolder={netHolder} /> }
            </Drawer.Screen>
          </Drawer.Navigator>
        </NavigationContainer>
    </SafeAreaView>
  )
}
export default App