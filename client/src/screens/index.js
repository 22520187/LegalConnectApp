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
import LawyerManagement from './Admin/LawyerManagement';
import AdminAccount from './Admin/AdminAccount';
import UserManagement from './Admin/UserManagement';
import PostManagement from './Admin/PostManagement';
import LegalDocuments from './LegalDocuments';
import LegalDocumentDetail from './LegalDocumentDetail';

const SCREENS = {
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    LEGAL_DOCUMENTS: 'LegalDocuments',
    LEGAL_DOCUMENT_DETAIL: 'LegalDocumentDetail',
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
    USER_MANAGEMENT: 'UserManagement',
    POST_MANAGEMENT: 'PostManagement',
    LAWYER_MANAGEMENT: 'LawyerManagement',
    ADMIN_ACCOUNT: 'AdminAccount',
}

export default SCREENS;
export { Home, MyPosts, Profile, AskQuestion, ChatBot, Message, QuestionDetail, ChatScreen, UserProfile, Notification, Search, UserManagement, PostManagement, LawyerManagement, AdminAccount, LegalDocuments, LegalDocumentDetail };