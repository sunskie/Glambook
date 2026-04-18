import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  BookOpen,
  Send,
  Bell,
  User,
  Edit,
  Phone,
  Video,
  Info,
  Smile,
  Mic,
} from 'lucide-react';
import { Chat, Channel, ChannelList, Window, ChannelHeader, MessageList, MessageInput, Thread } from 'stream-chat-react';
import { useChat } from '../../context/ChatContext';
import 'stream-chat-react/dist/css/v2/index.css';
import VendorSidebar from '../../components/Vendor/VendorSidebar';

const VendorMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, setActiveChannel } = useChat();
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [channels, setChannels] = useState<any[]>([]);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (state.client && state.isConnected) {
      loadChannels();
    }
  }, [state.client, state.isConnected]);

  const loadChannels = async () => {
    if (!state.client) return;
    
    try {
      const filters = { members: { $in: [state.user?.id] } };
      const sort = { last_message_at: -1 };
      const response = await state.client.queryChannels(filters, sort, { limit: 20 });
      setChannels(response);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const handleChannelClick = async (channel: any) => {
    try {
      await channel.watch();
      setSelectedChannel(channel);
      setActiveChannel(channel);
    } catch (error) {
      console.error('Failed to select channel:', error);
    }
  };

  const getOtherUser = (channel: any) => {
    const members = Object.values(channel.state.members);
    const otherMember = members.find((m: any) => m.user?.id !== state.user?.id);
    return otherMember?.user;
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel || !state.client) return;
    try {
      await selectedChannel.sendMessage({
        text: messageInput.trim(),
        user_id: state.user?.id,
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!state.isConnected && !state.client) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'white', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>Connecting to chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}>
      <VendorSidebar />
      <div style={{ marginLeft: '280px', flex: 1, display: 'flex' }}>
        {/* MIDDLE-LEFT COLUMN */}
        <div style={{ width: '350px', backgroundColor: 'white', borderRight: '1px solid #dbdbdb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #dbdbdb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#000' }}>
            {state.user?.name || 'Vendor'}
          </div>
          <button 
            onClick={() => console.log('New conversation')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
          >
            <Edit size={20} color="#5B62B3" />
          </button>
        </div>

        {/* Story-style recent contacts */}
        {channels.length > 0 && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #dbdbdb' }}>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
              {channels.slice(0, 4).map((channel, index) => {
                const otherUser = getOtherUser(channel);
                return (
                  <div key={channel.id} style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#5B62B3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '12px',
                      margin: '0 auto 4px',
                    }}>
                      {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8e8e8e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {otherUser?.name || 'Unknown'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {channels.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px' }}>
              <Send size={64} color="#dbdbdb" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>
                No messages yet
              </div>
              <div style={{ fontSize: '14px', color: '#8e8e8e', textAlign: 'center' }}>
                Your client conversations will appear here
              </div>
            </div>
          ) : (
            channels.map((channel) => {
              const otherUser = getOtherUser(channel);
              const lastMessage = channel.state.messages[channel.state.messages.length - 1];
              const unreadCount = channel.countUnread();
              const isSelected = selectedChannel?.id === channel.id;
              
              return (
                <div
                  key={channel.id}
                  onClick={() => handleChannelClick(channel)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 20px',
                    gap: '12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#efefef' : 'white',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                  onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#5B62B3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '18px',
                  }}>
                    {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#000', fontSize: '14px' }}>
                        {otherUser?.name || 'Unknown User'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#8e8e8e' }}>
                        {lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#8e8e8e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lastMessage?.text || 'No messages yet'}
                      </span>
                      {unreadCount > 0 && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#5B62B3',
                        }} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MESSAGE AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
        {!selectedChannel ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#5B62B3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '32px',
              marginBottom: '20px',
            }}>
              G
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>
              Your client inbox
            </div>
            <div style={{ fontSize: '14px', color: '#8e8e8e', textAlign: 'center', maxWidth: '320px', marginBottom: '24px' }}>
              Connect with clients, manage bookings, and provide exceptional service
            </div>
            <div style={{ fontSize: '14px', color: '#8e8e8e', marginBottom: '16px' }}>
              Waiting for clients to message you
            </div>
            <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '16px' }}>
              Recent activity
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Recent Bookings', 'Active Clients', 'New Clients'].map((label, index) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8e8e8e',
                    fontWeight: 600,
                    fontSize: '12px',
                    marginBottom: '4px',
                  }}>
                    {label.charAt(0)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8e8e8e' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#5B62B3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '16px',
              }}>
                {getOtherUser(selectedChannel)?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#000' }}>
                  {getOtherUser(selectedChannel)?.name || 'Unknown User'}
                </div>
                <div style={{ fontSize: '13px', color: '#389e0d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#389e0d' }} />
                  Active now
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Phone size={20} color="#8e8e8e" style={{ cursor: 'pointer' }} />
                <Video size={20} color="#8e8e8e" style={{ cursor: 'pointer' }} />
                <Info 
  size={20} 
  color={showInfoPanel ? '#5B62B3' : '#8e8e8e'} 
  style={{ cursor: 'pointer' }} 
  onClick={() => setShowInfoPanel(!showInfoPanel)}
/>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <Chat client={state.client}>
                <Channel channel={selectedChannel}>
                  <MessageList />
                </Channel>
              </Chat>
            </div>

            {/* Input Bar */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <Smile size={20} color="#8e8e8e" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid #dbdbdb',
                  borderRadius: '24px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#fafafa',
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                {messageInput.trim() ? <Send size={20} color="#5B62B3" /> : <Mic size={20} color="#8e8e8e" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PROFILE PANEL */}
      {selectedChannel && showInfoPanel && (
        <div style={{ width: '340px', borderLeft: '1px solid #dbdbdb', backgroundColor: 'white', padding: '32px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: '#5B62B3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '36px',
            }}>
              {getOtherUser(selectedChannel)?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#000', marginBottom: '4px' }}>
                {getOtherUser(selectedChannel)?.name || 'Unknown User'}
              </div>
              <div style={{ fontSize: '14px', color: '#8e8e8e' }}>
                Client
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
              {[
                { label: 'Bookings', value: '8' },
                { label: 'Services', value: '12' },
                { label: 'Rating', value: '4.9' },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#000' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8e8e8e' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ width: '100%', height: '1px', backgroundColor: '#dbdbdb' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  padding: '10px',
                  backgroundColor: '#5B62B3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}>
                View Profile
              </button>
              <button style={{
                padding: '10px',
                backgroundColor: '#efefef',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                Search in Conversation
              </button>
              <button style={{
                padding: '10px',
                backgroundColor: '#efefef',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                Mute Notifications
              </button>
              <button style={{
                padding: '10px',
                backgroundColor: 'none',
                color: '#ed4956',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                Block
              </button>
            </div>
            
            <div style={{ width: '100%', height: '1px', backgroundColor: '#dbdbdb' }} />
            
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '12px', textAlign: 'left' }}>
                Shared Content
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{
                    aspectRatio: '1',
                    backgroundColor: '#efefef',
                    borderRadius: '4px',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showProfileModal && selectedChannel && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowProfileModal(false)}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', padding: '32px',
            width: '480px', maxHeight: '80vh', overflowY: 'auto',
            fontFamily: 'Montserrat, sans-serif'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#000' }}>Profile</h2>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#8e8e8e' }}>✕</button>
            </div>

            {/* Avatar and name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                backgroundColor: '#5B62B3', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: 700,
                fontSize: '28px', marginBottom: '12px'
              }}>
                {getOtherUser(selectedChannel)?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#000' }}>
                {getOtherUser(selectedChannel)?.name || 'Unknown'}
              </div>
              <div style={{ fontSize: '14px', color: '#8e8e8e', marginTop: '4px' }}>
                {getOtherUser(selectedChannel)?.role || 'User'}
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Email', value: getOtherUser(selectedChannel)?.email || 'Not available' },
                { label: 'Phone', value: getOtherUser(selectedChannel)?.phone || 'Not available' },
                { label: 'Member Since', value: getOtherUser(selectedChannel)?.created_at ? new Date(getOtherUser(selectedChannel).created_at).toLocaleDateString() : 'Not available' },
              ].map(({ label, value }) => (
                <div key={label} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '4px', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '14px', color: '#000' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default VendorMessagesPage;
