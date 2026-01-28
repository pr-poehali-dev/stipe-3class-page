import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}



export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('stype_user');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadContacts();
    }
  }, []);

  const loadContacts = () => {
    const users = JSON.parse(localStorage.getItem('stype_users') || '[]');
    const currentUserId = JSON.parse(localStorage.getItem('stype_user') || '{}').id;
    const contactsList: Contact[] = users
      .filter((u: any) => u.id !== currentUserId)
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar || '👤',
        online: Math.random() > 0.3,
      }));
    setContacts(contactsList);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const users = JSON.parse(localStorage.getItem('stype_users') || '[]');
    const currentUserId = currentUser?.id;
    const results = users
      .filter((u: any) => 
        u.id !== currentUserId && 
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar || '👤',
      }));
    setSearchResults(results);
  };

  const addToContacts = (user: User) => {
    const newContact: Contact = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      online: true,
    };
    
    if (!contacts.find(c => c.id === user.id)) {
      setContacts([...contacts, newContact]);
      toast({
        title: 'Контакт добавлен',
        description: `${user.name} добавлен в ваши контакты`,
      });
    }
    
    setSearchQuery('');
    setSearchResults([]);
    setSelectedContact(newContact);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerNickname || !registerPassword) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem('stype_users') || '[]');
    const exists = users.find((u: User) => u.name === registerNickname);
    
    if (exists) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь с таким ником уже существует',
        variant: 'destructive',
      });
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: registerNickname,
      avatar: '🎓',
    };

    users.push({ ...newUser, password: registerPassword });
    localStorage.setItem('stype_users', JSON.stringify(users));
    localStorage.setItem('stype_user', JSON.stringify(newUser));
    
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    
    toast({
      title: 'Успешно!',
      description: 'Добро пожаловать на Stype!',
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const users = JSON.parse(localStorage.getItem('stype_users') || '[]');
    const user = users.find((u: any) => u.name === loginNickname && u.password === loginPassword);
    
    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Неверный ник или пароль',
        variant: 'destructive',
      });
      return;
    }

    const { password, ...userData } = user;
    localStorage.setItem('stype_user', JSON.stringify(userData));
    
    setCurrentUser(userData);
    setIsAuthenticated(true);
    
    toast({
      title: 'Вход выполнен!',
      description: `Привет, ${userData.name}!`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('stype_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setSelectedContact(null);
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !currentUser) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');


  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsInCall(true);
      
      toast({
        title: 'Звонок начат',
        description: 'Вы подключились к видеозвонку',
      });


      
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить доступ к камере/микрофону',
        variant: 'destructive',
      });
    }
  };

  const stopVideoCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    setIsInCall(false);
    setIsScreenSharing(false);
    
    toast({
      title: 'Звонок завершён',
      description: 'Вы отключились от видеозвонка',
    });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      
      setIsScreenSharing(false);
      
      toast({
        title: 'Демонстрация завершена',
        description: 'Вы прекратили показ экрана',
      });
      
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        screenStreamRef.current = screenStream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        toast({
          title: 'Демонстрация экрана',
          description: 'Вы начали показ экрана с аудио',
        });

        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          toggleScreenShare();
        });
        
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось получить доступ к экрану',
          variant: 'destructive',
        });
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        toast({
          title: videoTrack.enabled ? 'Камера включена' : 'Камера выключена',
          description: videoTrack.enabled ? 'Собеседник вас видит' : 'Собеседник вас не видит',
        });
      }
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        toast({
          title: audioTrack.enabled ? 'Микрофон включён' : 'Микрофон выключен',
          description: audioTrack.enabled ? 'Собеседник вас слышит' : 'Собеседник вас не слышит',
        });
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              🚀 Stype
            </CardTitle>
            <CardDescription>Образовательная платформа для 3 класса</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Ник</Label>
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="Ваш ник"
                      value={loginNickname}
                      onChange={(e) => setLoginNickname(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Войти
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-nickname">Ник</Label>
                    <Input
                      id="reg-nickname"
                      type="text"
                      placeholder="Придумайте ник"
                      value={registerNickname}
                      onChange={(e) => setRegisterNickname(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Пароль</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Зарегистрироваться
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-purple-100">
      <header className="bg-white shadow-md border-b-4 border-blue-500">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              🚀 Stype
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="text-2xl">{currentUser?.avatar}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{currentUser?.name}</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" size={20} />
                Контакты
              </CardTitle>
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Поиск по нику..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="sm">
                    <Icon name="Search" size={18} />
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-2 space-y-1">
                    <div className="text-xs text-gray-500 px-2">Результаты поиска:</div>
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 p-2 bg-white rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => addToContacts(user)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                        <Icon name="Plus" size={16} className="ml-auto text-blue-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px]">
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 ${
                        selectedContact?.id === contact.id ? 'bg-blue-100' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback className="text-2xl">{contact.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{contact.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {contact.online ? 'В сети' : 'Не в сети'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <Icon name="UserPlus" size={48} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Используйте поиск, чтобы найти друзей</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedContact ? (
                    <>
                      <Avatar>
                        <AvatarFallback className="text-2xl">{selectedContact.avatar}</AvatarFallback>
                      </Avatar>
                      {selectedContact.name}
                    </>
                  ) : (
                    <>
                      <Icon name="MessageSquare" size={20} />
                      Выберите контакт
                    </>
                  )}
                </div>
                {selectedContact && !isInCall && (
                  <Button onClick={startVideoCall} variant="outline" size="sm">
                    <Icon name="Video" size={18} className="mr-2" />
                    Звонок
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedContact ? (
                <div className="h-[600px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Icon name="MessageCircle" size={64} className="mx-auto mb-4 opacity-30" />
                    <p>Выберите контакт для начала общения</p>
                  </div>
                </div>
              ) : isInCall ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        Вы {isScreenSharing && '(Экран)'}
                      </div>
                    </div>
                    <div className="relative">
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {selectedContact.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      onClick={toggleCamera}
                      variant={isCameraOn ? 'default' : 'secondary'}
                      size="sm"
                    >
                      <Icon name={isCameraOn ? 'Video' : 'VideoOff'} size={18} className="mr-2" />
                      {isCameraOn ? 'Камера' : 'Камера выкл'}
                    </Button>
                    <Button
                      onClick={toggleMic}
                      variant={isMicOn ? 'default' : 'secondary'}
                      size="sm"
                    >
                      <Icon name={isMicOn ? 'Mic' : 'MicOff'} size={18} className="mr-2" />
                      {isMicOn ? 'Микрофон' : 'Микрофон выкл'}
                    </Button>
                    <Button
                      onClick={toggleScreenShare}
                      variant={isScreenSharing ? 'default' : 'outline'}
                      size="sm"
                    >
                      <Icon name="Monitor" size={18} className="mr-2" />
                      {isScreenSharing ? 'Остановить показ' : 'Показать экран'}
                    </Button>
                    <Button
                      onClick={stopVideoCall}
                      variant="destructive"
                      size="sm"
                    >
                      <Icon name="PhoneOff" size={18} className="mr-2" />
                      Завершить
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[500px] mb-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl ${
                              msg.senderId === currentUser?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <div className="font-semibold text-sm mb-1">{msg.senderName}</div>
                            <div>{msg.text}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Напишите сообщение..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}