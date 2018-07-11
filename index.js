const axios = require('axios');
const API_BASE_URL = "http://ui-developer-backend.herokuapp.com/api";

async function getRecentConversationSummaries() {

    // TODO: Implement this
    let finalConversations = [];
    let users$ = [];

    const messages = await fetchMessages();

    //Sorting messages by time
    const sortedMessages = sortMessages(messages);

    sortedMessages.forEach(message => {
        const conversationSummary = {
            id: message.conversation_id,
            latest_message: {
                id: message.id,
                body: message.body,
                from_user: {
                    id: message.from_user_id,
                    avatar_url: null
                },
                created_at: message.created_at
            }
        };

        //Checking whether a conversation already exists in the finalConversation Array or not
        const position = finalConversations.findIndex(finalConversation => finalConversation.id === message.conversation_id);

        if (position === -1) {
            finalConversations.push(conversationSummary);
            const user$ = axios.get(API_BASE_URL + '/users/' + message.from_user_id);
            users$.push(user$);
        }
    });

    const userPromises = await Promise.all(users$);
    getUserData(finalConversations, userPromises);
    //console.log(finalConversations[0]);
    return finalConversations;
};


function sortMessages(messages) {
    const sortedMessages = messages.sort((m1, m2) => {

        const Date1 = new Date(m1.created_at);
        const Date2 = new Date(m2.created_at);
        return Date1 < Date2;
    });
    return sortedMessages;
}

async function fetchMessages() {
    const conversations$ = await axios.get(API_BASE_URL + '/conversations');
    const conversations = conversations$.data;
    let messages$ = []
    let messages = [];

    conversations.forEach(conversation => {
        const message$ = axios.get(API_BASE_URL + '/conversations/' + conversation.id + '/messages');
        messages$.push(message$);
    });

    const messagesPromises = await Promise.all(messages$);
    messagesPromises.forEach(messageRes => {
        messageRes.data.forEach(message => {
            messages.push(message);

        });
    });

    return messages;
}

async function getUserData(finalConversations, userPromises) {

    userPromises.map((userPromise, i) => {
        finalConversations[i].latest_message.from_user = {
            id: userPromise.data.id,
            avatar_url: userPromise.data.avatar_url
        }
    });
}

getRecentConversationSummaries();