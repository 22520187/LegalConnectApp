import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Login from '../screens/Auth/Login';
import SignUp from '../screens/Auth/SignUp';
import SCREENS, { Home, MyPosts, Profile, AskQuestion, ChatBot, Message, QuestionDetail, ChatScreen, UserProfile, Notification, Search, UserManagement, PostManagement, LawyerManagement, AdminAccount, LegalDocuments, LegalDocumentDetail } from '../screens';
import { useIsKeyboardVisible } from '../hooks/useIsKeyboardVisible';
import COLORS from '../constant/colors';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function LandingStackNavigator() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.LEGAL_DOCUMENTS} screenOptions={{ headerShown: false }}>
            <Stack.Screen name={SCREENS.LEGAL_DOCUMENTS} component={LegalDocuments} />
            <Stack.Screen name={SCREENS.LEGAL_DOCUMENT_DETAIL} component={LegalDocumentDetail} />
            <Stack.Screen name={SCREENS.LOGIN} component={Login} />
            <Stack.Screen name={SCREENS.SIGNUP} component={SignUp} />
        </Stack.Navigator>
    );
}

function AuthStackNavigator() {
    return (
        <Stack.Navigator initialRouteName={SCREENS.LOGIN} screenOptions={{ headerShown: false }}>
            <Stack.Screen name={SCREENS.LOGIN} component={Login} />
            <Stack.Screen name={SCREENS.SIGNUP} component={SignUp} />
        </Stack.Navigator>
    );
}

function MyPostsStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MyPostsList" component={MyPosts} />
            <Stack.Screen name={SCREENS.ASKQUESTION} component={AskQuestion} />
            <Stack.Screen name={SCREENS.QUESTIONDETAIL} component={QuestionDetail} />
            <Stack.Screen name={SCREENS.USERPROFILE} component={UserProfile} />
        </Stack.Navigator>
    );
}

function MessageStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MessageList" component={Message} />
            <Stack.Screen name={SCREENS.CHATSCREEN} component={ChatScreen} />
            <Stack.Screen name={SCREENS.USERPROFILE} component={UserProfile} />
        </Stack.Navigator>
    );
}

function ProfileStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={Profile} />
            <Stack.Screen name={SCREENS.USERPROFILE} component={UserProfile} />
        </Stack.Navigator>
    );
}

function HomeStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeList" component={Home} />
            <Stack.Screen name={SCREENS.QUESTIONDETAIL} component={QuestionDetail} />
            <Stack.Screen name={SCREENS.USERPROFILE} component={UserProfile} />
            <Stack.Screen name={SCREENS.CHATSCREEN} component={ChatScreen} />
            <Stack.Screen name={SCREENS.NOTIFICATION} component={Notification} />
            <Stack.Screen name={SCREENS.SEARCH} component={Search} />
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
                    } else if (route.name === SCREENS.CHATBOT) {
                        iconName = focused ? 'logo-octocat' : 'logo-octocat';
                    } else if (route.name === SCREENS.MESSAGE) {
                        iconName = focused ? 'chatbox' : 'chatbox-outline';
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
                component={HomeStackNavigator}
                options={{
                    tabBarLabel: 'Diễn đàn',
                }}
            />
            <Tab.Screen
                name={SCREENS.MYPOSTS}
                component={MyPostsStackNavigator}
                options={{
                    tabBarLabel: 'Bài viết',
                }}
            />
            <Tab.Screen
                name={SCREENS.CHATBOT}
                component={ChatBot}
                options={{
                    tabBarLabel: 'ChatBot',
                }}
            />
            <Tab.Screen
                name={SCREENS.MESSAGE}
                component={MessageStackNavigator}
                options={{
                    tabBarLabel: 'Tin nhắn',
                }}
            />
            <Tab.Screen
                name={SCREENS.PROFILE}
                component={ProfileStackNavigator}
                options={{
                    tabBarLabel: 'Hồ sơ',
                }}
            />
        </Tab.Navigator>
    )
}

const AdminTabNavigator = () => {
    const {isKeyboardVisible} = useIsKeyboardVisible();
    return (
        <Tab.Navigator
            initialRouteName={SCREENS.POST_MANAGEMENT}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    
                    if (route.name === SCREENS.POST_MANAGEMENT) {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    } else if (route.name === SCREENS.USER_MANAGEMENT) {
                        iconName = focused ? 'people' : 'people-outline';
                    }else if (route.name === SCREENS.ADMIN_ACCOUNT) {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === SCREENS.LAWYER_MANAGEMENT) {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
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
                name={SCREENS.POST_MANAGEMENT}
                component={PostManagement}
                options={{
                    tabBarLabel: 'Bài viết',
                }}
            />
            <Tab.Screen
                name={SCREENS.USER_MANAGEMENT}
                component={UserManagement}
                options={{
                    tabBarLabel: 'Người dùng',
                }}
            />
            <Tab.Screen
                name={SCREENS.LAWYER_MANAGEMENT}
                component={LawyerManagement}
                options={{
                    tabBarLabel: 'Luật sư',
                }}
            />
            <Tab.Screen
                name={SCREENS.ADMIN_ACCOUNT}
                component={AdminAccount}
                options={{
                    tabBarLabel: 'Tài khoản',
                }}
            />
        </Tab.Navigator>
    )
}

export { LandingStackNavigator, AuthStackNavigator, UserTabNavigator, AdminTabNavigator };