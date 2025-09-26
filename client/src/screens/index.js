import Home from './User/Home';
import MyPosts from './User/MyPosts';
import Profile from './User/Profile';
import AskQuestion from './User/AskQuestion';
import ChatBot from './User/ChatBot';
import Message from './User/Message';
import QuestionDetail from './User/QuestionDetail';
import ChatScreen from './User/ChatScreen';
import UserProfile from './User/UserProfile';
import Notification from './User/Notification';
import Search from './User/Search';
import AdminDashboard from './Admin/AdminDashboard';
import UserManagement from './Admin/UserManagement';
import PostManagement from './Admin/PostManagement';

const SCREENS = {
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    HOME: 'Home',
    PROFILE: 'Profile',
    MYPOSTS: 'MyPosts',
    ASKQUESTION: 'AskQuestion',
    CHATBOT: 'ChatBot',
    MESSAGE: 'Message',
    QUESTIONDETAIL: 'QuestionDetail',
    CHATSCREEN: 'ChatScreen',
    USERPROFILE: 'UserProfile',
    NOTIFICATION: 'Notification',
    SEARCH: 'Search',
    ADMIN_DASHBOARD: 'AdminDashboard',
    USER_MANAGEMENT: 'UserManagement',
    POST_MANAGEMENT: 'PostManagement',
}

export default SCREENS;
export { Home, MyPosts, Profile, AskQuestion, ChatBot, Message, QuestionDetail, ChatScreen, UserProfile, Notification, Search, AdminDashboard, UserManagement, PostManagement };