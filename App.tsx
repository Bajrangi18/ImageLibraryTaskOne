import { SafeAreaView,Dimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './Components/HomePage';
import { useEffect, useState,useRef } from 'react';
import {Animated} from 'react-native'


const Drawer = createDrawerNavigator();

const App = () => {
    const [showHead,setShowHead] = useState(true)
    const headerVal = useRef(new Animated.Value(56)).current
    const headerOpa = useRef(new Animated.Value(1)).current
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
    return(
    <SafeAreaView style={{height:Dimensions.get("window").height,width:Dimensions.get("window").width}}>
    <NavigationContainer>
          <Drawer.Navigator initialRouteName="Home" screenOptions={{drawerStyle:{backgroundColor:'black'},drawerActiveTintColor:'white',drawerActiveBackgroundColor:'rgba(255,255,255,0.25)'}}  >
            <Drawer.Screen  name="Home" options={{headerStyle:{backgroundColor:'black',height:headerVal,opacity:headerOpa},headerTintColor:'white'}}>
              {props => <HomePage {...props} setShowHead={setShowHead}/> }
            </Drawer.Screen>
          </Drawer.Navigator>
        </NavigationContainer>
    </SafeAreaView>
  )
}
export default App