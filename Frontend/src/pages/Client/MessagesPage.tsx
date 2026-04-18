import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit, Phone, Video, Info, Smile, Mic, Send } from 'lucide-react';
import { Chat, Channel, MessageList } from 'stream-chat-react';
import { useChat } from '../../context/ChatContext';
import 'stream-chat-react/dist/css/v2/index.css';
import ClientSidebar from '../../components/Client/ClientSidebar';

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, setActiveChannel } = useChat();
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [channels, setChannels] = useState<any[]>([]);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (state.client && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadChannels();
    }
  }, [state.client]);

  useEffect(() => {
    const vendorId = searchParams.get('vendorId');
    if (vendorId && state.client && state.user?.id) {
      const open = async () => {
        try {
          const ids = [state.user!.id, vendorId].sort();
          const channelId = `messaging-${ids[0]}-${ids[1]}`;
          const channel = state.client.channel('messaging', channelId, { members: [state.user!.id, vendorId] });
          await channel.watch();
          setActiveChannel(channel);
          setSelectedChannel(channel);
          loadChannels();
        } catch (err) {
          console.error('Failed to open channel:', err);
        }
      };
      open();
    }
  }, [searchParams, state.client, state.user?.id]);

  const loadChannels = async () => {
    if (!state.client) return;
    try {
      const res = await state.client.queryChannels(
        { members: { $in: [state.user?.id] } },
        { last_message_at: -1 },
        { limit: 20 }
      );
      setChannels(res);
    } catch (err) {
      console.error('Failed to load channels:', err);
    }
  };

  const handleChannelClick = async (channel: any) => {
    try {
      await channel.watch();
      setSelectedChannel(channel);
      setActiveChannel(channel);
      setShowInfoPanel(false);
    } catch (err) {
      console.error('Failed to select channel:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel || !state.client) return;
    try {
      await selectedChannel.sendMessage({ text: messageInput.trim(), user_id: state.user?.id });
      setMessageInput('');
      loadChannels();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = (channel: any) => {
    if (!channel?.state?.members || !state.user) return null;
    const members = Object.values(channel.state.members);
    const other = members.find((m: any) => m.user?.id !== state.user?.id);
    return (other as any)?.user;
  };

  if (!state.client) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Montserrat, sans-serif' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Connecting to chat...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Montserrat, sans-serif', overflow: 'hidden' }}>

      {/* SIDEBAR */}
      <ClientSidebar />

      {/* CONVERSATION LIST */}
      <div style={{ marginLeft: '280px', width: '350px', backgroundColor: 'white', borderRight: '1px solid #dbdbdb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        <div style={{ padding: '20px', borderBottom: '1px solid #dbdbdb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#000' }}>Messages</div>
          <button onClick={() => navigate('/client/services')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <Edit size={20} color="#5B62B3" />
          </button>
        </div>

        {channels.length > 0 && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #dbdbdb', display: 'flex', gap: '12px', overflowX: 'auto' }}>
            {channels.slice(0, 4).map((ch) => {
              const u = getOtherUser(ch);
              return (
                <div key={ch.id} onClick={() => handleChannelClick(ch)} style={{ textAlign: 'center', minWidth: '56px', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#5B62B3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '14px', margin: '0 auto 4px' }}>
                    {u?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8e8e8e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u?.name || 'User'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {channels.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px', textAlign: 'center' }}>
              <Send size={56} color="#dbdbdb" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>No messages yet</div>
              <div style={{ fontSize: '13px', color: '#8e8e8e' }}>Start a conversation from a vendor's service page</div>
            </div>
          ) : (
            channels.map((ch) => {
              const u = getOtherUser(ch);
              const msgs = ch.state?.messages || [];
              const last = msgs[msgs.length - 1];
              const unread = ch.countUnread();
              const isActive = selectedChannel?.id === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => handleChannelClick(ch)}
                  style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', gap: '12px', cursor: 'pointer', backgroundColor: isActive ? '#efefef' : 'white', borderBottom: '1px solid #f0f0f0' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#fafafa'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#5B62B3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '18px', flexShrink: 0 }}>
                    {u?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600, color: '#000', fontSize: '14px' }}>{u?.name || 'Unknown'}</span>
                      <span style={{ fontSize: '11px', color: '#8e8e8e' }}>
                        {last ? new Date(last.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#8e8e8e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {last?.text || 'No messages yet'}
                      </span>
                      {unread > 0 && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5B62B3', flexShrink: 0 }} />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MESSAGE AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white', overflow: 'hidden' }}>
        {!selectedChannel ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#5B62B3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '32px', marginBottom: '20px' }}>G</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>Welcome to your inbox</div>
            <div style={{ fontSize: '14px', color: '#8e8e8e', maxWidth: '320px', marginBottom: '24px' }}>Connect with beauty professionals, book sessions, and chat about your next look</div>
            <button onClick={() => navigate('/client/services')} style={{ padding: '12px 32px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '24px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', marginBottom: '32px' }}>
              Start a Conversation
            </button>
            <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '16px' }}>Suggested for you</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Stylists', 'Artists', 'Brands'].map((label) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8e8e8e', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    {label.charAt(0)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8e8e8e' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#5B62B3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '16px' }}>
                {getOtherUser(selectedChannel)?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#000' }}>{getOtherUser(selectedChannel)?.name || 'Unknown'}</div>
                <div style={{ fontSize: '13px', color: '#389e0d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#389e0d' }} />
                  Active now
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Phone size={20} color="#8e8e8e" style={{ cursor: 'pointer' }} />
                <Video size={20} color="#8e8e8e" style={{ cursor: 'pointer' }} />
                <Info size={20} color={showInfoPanel ? '#5B62B3' : '#8e8e8e'} style={{ cursor: 'pointer' }} onClick={() => setShowInfoPanel(!showInfoPanel)} />
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Chat client={state.client}>
                <Channel channel={selectedChannel}>
                  <MessageList />
                </Channel>
              </Chat>
            </div>

            {/* Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <Smile size={20} color="#8e8e8e" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                style={{ flex: 1, padding: '10px 16px', border: '1px solid #dbdbdb', borderRadius: '24px', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa', fontFamily: 'Montserrat, sans-serif' }}
              />
              <button onClick={handleSendMessage} disabled={!messageInput.trim()} style={{ background: 'none', border: 'none', cursor: messageInput.trim() ? 'pointer' : 'default', padding: '8px' }}>
                {messageInput.trim() ? <Send size={20} color="#5B62B3" /> : <Mic size={20} color="#8e8e8e" />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      {selectedChannel && showInfoPanel && (
        <div style={{ width: '320px', borderLeft: '1px solid #dbdbdb', backgroundColor: 'white', padding: '32px 24px', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#5B62B3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '36px' }}>
              {getOtherUser(selectedChannel)?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#000', marginBottom: '4px' }}>{getOtherUser(selectedChannel)?.name || 'Unknown'}</div>
              <div style={{ fontSize: '14px', color: '#8e8e8e' }}>Vendor</div>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {[{ label: 'Bookings', value: '12' }, { label: 'Courses', value: '8' }, { label: 'Rating', value: '4.8' }].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#000' }}>{value}</div>
                  <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#dbdbdb' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <button onClick={() => setShowProfileModal(true)} style={{ padding: '10px', backgroundColor: '#5B62B3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>View Profile</button>
              <button style={{ padding: '10px', backgroundColor: '#efefef', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Search in Conversation</button>
              <button style={{ padding: '10px', backgroundColor: '#efefef', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Mute Notifications</button>
              <button style={{ padding: '10px', backgroundColor: 'transparent', color: '#ed4956', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Block</button>
            </div>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#dbdbdb' }} />
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '12px' }}>Shared Content</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} style={{ aspectRatio: '1', backgroundColor: '#efefef', borderRadius: '4px' }} />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedChannel && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowProfileModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '480px', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#000' }}>Profile</h2>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#8e8e8e' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#5B62B3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '28px', marginBottom: '12px' }}>
                {getOtherUser(selectedChannel)?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#000' }}>{getOtherUser(selectedChannel)?.name || 'Unknown'}</div>
              <div style={{ fontSize: '14px', color: '#8e8e8e', marginTop: '4px' }}>{getOtherUser(selectedChannel)?.role || 'Vendor'}</div>
            </div>
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
  );
};

export default MessagesPage;