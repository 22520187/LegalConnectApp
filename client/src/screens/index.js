import Home from './User/Home';
import MyPosts from './User/MyPosts';
import Profile from './User/Profile';
import AskQuestion from './User/AskQuestion';
import ChatBot from './User/ChatBot';
import Message from './User/Message';
import QuestionDetail from './User/QuestionDetail';
import ChatScreen from './User/ChatScreen';
import UserProfile from './User/UserProfile';

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
}

export default SCREENS;
export { Home, MyPosts, Profile, AskQuestion, ChatBot, Message, QuestionDetail, ChatScreen, UserProfile };