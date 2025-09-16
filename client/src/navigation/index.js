import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Login from '../screens/Auth/Login';
import SignUp from '../screens/Auth/SignUp';
import SCREENS, { Home, MyPosts, Profile } from '../screens';
import { useIsKeyboardVisible } from '../hooks/useIsKeyboardVisible';
import COLORS from '../constant/colors';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStackNavigator() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.LOGIN} screenOptions={{ headerShown: false }}>
            <Stack.Screen name={SCREENS.LOGIN} component={Login} />
            <Stack.Screen name={SCREENS.SIGNUP} component={SignUp} />
        </Stack.Navigator>
    );
}

const UserTabNavigator = () => {
    const {isKeyboardVisible} = useIsKeyboardVisible();
    return (
        <Tab.Navigator
            initialRouteName={SCREENS.HOME}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    
                    if (route.name === SCREENS.HOME) {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === SCREENS.MYPOSTS) {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    } else if (route.name === SCREENS.PROFILE) {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.BLUE,
                tabBarInactiveTintColor: COLORS.GRAY,
                tabBarStyle: {
                    display: isKeyboardVisible ? 'none' : 'flex',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={Home}
                options={{
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name={SCREENS.MYPOSTS}
                component={MyPosts}
                options={{
                    tabBarLabel: 'My Posts',
                }}
            />
            <Tab.Screen
                name={SCREENS.PROFILE}
                component={Profile}
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    )
}

export { AuthStackNavigator, UserTabNavigator };