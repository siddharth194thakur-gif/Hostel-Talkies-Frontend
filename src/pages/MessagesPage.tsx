import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, User as UserIcon, Users, Plus, MoreVertical,
  ArrowLeft, X, Search, Check, CheckCheck, Trash2,
  LogOut, UserPlus, Image as ImageIcon, Crown,
  Paperclip, Smile, Eye, FileDown, UploadCloud, ChevronDown,
  Palette, Flag, Info, ArrowUp, ArrowDown, Ban,
  CornerUpLeft, Copy, Video, FileText, Sparkles, MessageSquare
} from 'lucide-react';
import api, { getMediaUrl } from '../api/client';
import {
  Conversation, Message, PublicUser, MessageReactionItem,
  UserChatPreference
} from '../types';

import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState, LoadingSkeleton } from '../components/LoadingSkeleton';
import { GenderIcon } from '../components/GenderIcon';
import { EmojiPicker } from '../components/EmojiPicker';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { AttachmentComposerModal } from '../components/AttachmentComposerModal';
import { ChatCustomizationModal, WALLPAPER_OPTIONS } from '../components/ChatCustomizationModal';
import { ReportModal } from '../components/ReportModal';

const QUICK_REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🔥', '👏'];

// Helper to check if a message consists exclusively of 1 to 3 emojis
const isEmojiOnlyMessage = (text: string): boolean => {
  if (!text) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  // Regex matching unicode emojis
  const emojiRegex = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\uFE0F|\u200D|\s)+$/u;
  if (!emojiRegex.test(trimmed)) return false;

  // Count number of emoji segments
  const segments = [...new Intl.Segmenter().segment(trimmed)].filter(s => s.segment.trim().length > 0);
  return segments.length >= 1 && segments.length <= 3;
};

// Helper for file type icons & colors in document cards
const getFileCardMeta = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) {
    return { label: 'PDF Document', color: 'bg-rose-500 text-white', badge: 'PDF' };
  }
  if (['doc', 'docx'].includes(ext)) {
    return { label: 'Word Document', color: 'bg-blue-600 text-white', badge: 'DOC' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return { label: 'Excel Spreadsheet', color: 'bg-emerald-600 text-white', badge: 'XLS' };
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return { label: 'PowerPoint Slide', color: 'bg-amber-500 text-white', badge: 'PPT' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { label: 'Compressed Archive', color: 'bg-purple-600 text-white', badge: 'ZIP' };
  }
  if (['txt', 'md', 'rtf'].includes(ext)) {
    return { label: 'Text Document', color: 'bg-slate-600 text-white', badge: 'TXT' };
  }
  return { label: 'Document File', color: 'bg-indigo-600 text-white', badge: ext.toUpperCase() || 'FILE' };
};

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchUnreadCounts } = useNotifications();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Chat Customization State
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [chatPreferences, setChatPreferences] = useState<UserChatPreference>({
    bg_type: 'default',
    bg_value: '',
    bubble_style: 'classic',
    theme_mode: 'system',
  });

  // Replying state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);

  // Emoji Picker Popover state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Attachment Menu Popover state
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // File to send (composer review modal)
  const [selectedFileForComposer, setSelectedFileForComposer] = useState<File | null>(null);

  // Drag & Drop State
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState<{ src: string; sender?: string; time?: string } | null>(null);

  // Header 3-Dot Dropdown Menu
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // Active message context menu
  const [activeMessageMenuId, setActiveMessageMenuId] = useState<number | null>(null);
  const [copiedFeedbackId, setCopiedFeedbackId] = useState<number | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  // Message long press tracking refs
  const longPressTimerRef = useRef<any>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressActiveRef = useRef(false);

  // Conversation List Context Menu & Delete Modal
  const [activeConvMenuId, setActiveConvMenuId] = useState<number | null>(null);
  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null);
  const [isDeletingConv, setIsDeletingConv] = useState(false);

  // Conversation Long Press tracking refs
  const convLongPressTimerRef = useRef<any>(null);
  const convTouchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isConvLongPressActiveRef = useRef(false);

  // Report Modal State
  const [reportingTarget, setReportingTarget] = useState<{ type: 'user' | 'post'; id: string; title: string } | null>(null);

  // Block & Unblock Modal States in Chat
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [showUnblockConfirmModal, setShowUnblockConfirmModal] = useState(false);
  const [isProcessingBlock, setIsProcessingBlock] = useState(false);

  // Group Modals State
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);

  // Create Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupAvatar, setNewGroupAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [availableMembers, setAvailableMembers] = useState<PublicUser[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [createGroupError, setCreateGroupError] = useState('');

  // Add Members to Existing Group
  const [addMemberSearchQuery, setAddMemberSearchQuery] = useState('');
  const [addAvailableMembers, setAddAvailableMembers] = useState<PublicUser[]>([]);
  const [addSelectedMemberIds, setAddSelectedMemberIds] = useState<number[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // File input refs for each attachment type
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Popover Container Refs for outside click handling
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // Outside click handler to cleanly close floating menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
      if (showAttachmentMenu && attachmentMenuRef.current && !attachmentMenuRef.current.contains(target)) {
        setShowAttachmentMenu(false);
      }
      if (showHeaderMenu && headerMenuRef.current && !headerMenuRef.current.contains(target)) {
        setShowHeaderMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker, showAttachmentMenu, showHeaderMenu]);

  // Load chat preferences from localStorage cache, then refresh from API
  const loadChatPreferences = async (convId?: number) => {
    const cacheKey = `ht_chat_pref_${user?.id}_${convId || 'global'}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setChatPreferences(JSON.parse(cached));
      } catch (e) {
        // ignore
      }
    }

    try {
      const url = convId ? `/messages/${convId}/preferences/` : '/messages/preferences/';
      const res = await api.get<UserChatPreference>(url);
      if (res.data) {
        setChatPreferences(res.data);
        localStorage.setItem(cacheKey, JSON.stringify(res.data));
      }
    } catch (err) {
      // ignore
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get<{ results: Conversation[] } | Conversation[]>('/messages/');
      const list = Array.isArray(res.data) ? res.data : res.data.results || [];
      setConversations(list);
      return list;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const fetchConversationDetail = async (id: number) => {
    try {
      const res = await api.get<Conversation>(`/messages/${id}/`);
      setActiveConversation(res.data);
      setMessages(res.data.messages || []);
      if (res.data.is_group) {
        setActiveTab('groups');
      } else {
        setActiveTab('direct');
      }
      fetchUnreadCounts();
      loadChatPreferences(id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const list = await fetchConversations();
      if (conversationId) {
        fetchConversationDetail(parseInt(conversationId));
      } else if (list.length > 0 && window.innerWidth >= 768) {
        fetchConversationDetail(list[0].id);
      }
    };
    init();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Periodic polling for new messages in active conversation
  useEffect(() => {
    if (!activeConversation?.id) return;
    const currentConvId = activeConversation.id;

    const pollInterval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await api.get<Conversation>(`/messages/${currentConvId}/`);
        const newMsgs = res.data?.messages;
        if (newMsgs && Array.isArray(newMsgs)) {
          setMessages((prev) => {
            if (prev.length !== newMsgs.length) {
              return newMsgs;
            }
            return prev;
          });
        }
      } catch (e) {
        // silent catch
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [activeConversation?.id]);


  // Scroll to message on reply click with momentary highlight flash
  const scrollToMessage = (messageId: number) => {
    const element = document.getElementById(`message-item-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 1800);
    }
  };

  // Search members for group creation
  useEffect(() => {
    if (!showCreateGroup) return;
    const delayDebounce = setTimeout(async () => {
      setIsSearchingMembers(true);
      try {
        const res = await api.get<PublicUser[]>(`/messages/available-members/?search=${encodeURIComponent(memberSearchQuery)}`);
        setAvailableMembers(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingMembers(false);
      }
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [memberSearchQuery, showCreateGroup]);

  // Search members to add to existing group
  useEffect(() => {
    if (!showAddMembersModal || !activeConversation) return;
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get<PublicUser[]>(`/messages/available-members/?search=${encodeURIComponent(addMemberSearchQuery)}`);
        const existingIds = new Set(activeConversation.participants || []);
        const filtered = (res.data || []).filter(m => !existingIds.has(m.id));
        setAddAvailableMembers(filtered);
      } catch (err) {
        console.error(err);
      }
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [addMemberSearchQuery, showAddMembersModal, activeConversation]);

  // Send Text Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || !messageInput.trim() || isSending) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('content', messageInput.trim());
      formData.append('message_type', 'text');
      if (replyingTo) {
        formData.append('reply_to_id', replyingTo.id.toString());
      }

      const res = await api.post<Message>(`/messages/${activeConversation.id}/send/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessages((prev) => [...prev, res.data]);
      setMessageInput('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      fetchConversations();
      fetchUnreadCounts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Send File/Media from Review Composer
  const handleSendAttachment = async (file: File, caption: string) => {
    if (!activeConversation || isSending) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (caption) {
        formData.append('content', caption);
      }
      if (replyingTo) {
        formData.append('reply_to_id', replyingTo.id.toString());
      }

      const res = await api.post<Message>(`/messages/${activeConversation.id}/send/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessages((prev) => [...prev, res.data]);
      setSelectedFileForComposer(null);
      setReplyingTo(null);
      fetchConversations();
      fetchUnreadCounts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send file. Please check file format and size limit (25MB).');
    } finally {
      setIsSending(false);
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFileForComposer(file);
    }
  };

  // Reaction handler
  const handleReaction = async (messageId: number, reactionEmoji: string) => {
    try {
      const res = await api.post<MessageReactionItem[]>(`/messages/messages/${messageId}/react/`, {
        reaction: reactionEmoji,
      });
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return { ...m, reactions: res.data };
        }
        return m;
      }));
      setActiveMessageMenuId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId: number, deleteType: 'for_me' | 'for_everyone') => {
    try {
      setIsDeletingMessage(true);
      await api.post(`/messages/messages/${messageId}/delete/`, {
        delete_type: deleteType,
      });

      if (deleteType === 'for_me') {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      } else {
        setMessages(prev => prev.map(m => {
          if (m.id === messageId) {
            return { ...m, is_deleted_everyone: true, content: '🚫 This message was deleted', file: null };
          }
          return m;
        }));
      }
      setActiveMessageMenuId(null);
      setMessageToDelete(null);
      fetchConversations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete message.');
    } finally {
      setIsDeletingMessage(false);
    }
  };

  // Mobile Touch Long Press Handlers
  const handleTouchStart = (msgId: number, e: React.TouchEvent) => {
    touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isLongPressActiveRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      setActiveMessageMenuId(msgId);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(40); } catch (_) {}
      }
    }, 550);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
    if (dx > 10 || dy > 10) {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    setTimeout(() => {
      isLongPressActiveRef.current = false;
    }, 150);
  };

  // Conversation List Mobile Touch Long Press Handlers
  const handleConvTouchStart = (convId: number, e: React.TouchEvent) => {
    convTouchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    isConvLongPressActiveRef.current = false;
    if (convLongPressTimerRef.current) clearTimeout(convLongPressTimerRef.current);

    convLongPressTimerRef.current = setTimeout(() => {
      isConvLongPressActiveRef.current = true;
      setActiveConvMenuId(convId);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(40); } catch (_) {}
      }
    }, 550);
  };

  const handleConvTouchMove = (e: React.TouchEvent) => {
    if (!convTouchStartPosRef.current) return;
    const dx = Math.abs(e.touches[0].clientX - convTouchStartPosRef.current.x);
    const dy = Math.abs(e.touches[0].clientY - convTouchStartPosRef.current.y);
    if (dx > 8 || dy > 8) {
      if (convLongPressTimerRef.current) clearTimeout(convLongPressTimerRef.current);
    }
  };

  const handleConvTouchEnd = () => {
    if (convLongPressTimerRef.current) clearTimeout(convLongPressTimerRef.current);
    setTimeout(() => {
      isConvLongPressActiveRef.current = false;
    }, 200);
  };

  // Delete Conversation Handler
  const handleDeleteConversation = async () => {
    if (!convToDelete) return;
    setIsDeletingConv(true);
    const deletedId = convToDelete.id;
    try {
      await api.delete(`/messages/${deletedId}/`);
    } catch (err) {
      console.warn('Backend conversation deletion notice, removing from local list:', err);
    } finally {
      setConversations((prev) => prev.filter((c) => c.id !== deletedId));
      if (activeConversation?.id === deletedId) {
        setActiveConversation(null);
        navigate('/messages');
      }
      setConvToDelete(null);
      setIsDeletingConv(false);
    }
  };

  // Copy message text
  const handleCopyMessage = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedFeedbackId(id);
    setTimeout(() => {
      setCopiedFeedbackId(null);
      setActiveMessageMenuId(null);
    }, 1200);
  };

  // Block & Unblock in Chat
  const handleBlockUserInChat = async () => {
    if (!activeConversation?.other_user?.id) return;
    try {
      setIsProcessingBlock(true);
      await api.post(`/auth/users/${activeConversation.other_user.id}/block/`);
      setActiveConversation(prev => prev ? {
        ...prev,
        is_blocked_by_me: true,
        other_user: prev.other_user ? { ...prev.other_user, is_blocked_by_me: true } : null
      } : null);
      setShowBlockConfirmModal(false);
      fetchConversations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to block user.');
    } finally {
      setIsProcessingBlock(false);
    }
  };

  const handleUnblockUserInChat = async () => {
    if (!activeConversation?.other_user?.id) return;
    try {
      setIsProcessingBlock(true);
      await api.post(`/auth/users/${activeConversation.other_user.id}/unblock/`);
      setActiveConversation(prev => prev ? {
        ...prev,
        is_blocked_by_me: false,
        other_user: prev.other_user ? { ...prev.other_user, is_blocked_by_me: false } : null
      } : null);
      setShowUnblockConfirmModal(false);
      fetchConversations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to unblock user.');
    } finally {
      setIsProcessingBlock(false);
    }
  };


  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Keyboard handler: Enter sends, Shift+Enter new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Create Group Form
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setIsCreatingGroup(true);
    setCreateGroupError('');

    try {
      const formData = new FormData();
      formData.append('group_name', newGroupName.trim());
      if (newGroupAvatar) {
        formData.append('group_avatar', newGroupAvatar);
      }
      formData.append('member_ids', JSON.stringify(selectedMemberIds));

      const res = await api.post<Conversation>('/messages/groups/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupAvatar(null);
      setAvatarPreview(null);
      setSelectedMemberIds([]);
      await fetchConversations();
      navigate(`/messages/${res.data.id}`);
    } catch (err: any) {
      setCreateGroupError(err.response?.data?.detail || 'Failed to create group.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Add Members to Existing Group Form
  const handleAddMembersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || addSelectedMemberIds.length === 0) return;
    setIsAddingMembers(true);
    try {
      const res = await api.post<Conversation>(`/messages/groups/${activeConversation.id}/add-members/`, {
        member_ids: addSelectedMemberIds
      });
      setActiveConversation(res.data);
      setShowAddMembersModal(false);
      setAddSelectedMemberIds([]);
      setAddMemberSearchQuery('');
      fetchConversations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add members to group.');
    } finally {
      setIsAddingMembers(false);
    }
  };

  // Leave Group
  const handleLeaveGroup = async () => {
    if (!activeConversation || !window.confirm('Are you sure you want to leave this private group?')) return;
    try {
      await api.post(`/messages/groups/${activeConversation.id}/leave/`);
      setShowGroupInfo(false);
      setShowHeaderMenu(false);
      setActiveConversation(null);
      await fetchConversations();
      navigate('/messages');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to leave group.');
    }
  };

  // Delete Group (Admin only)
  const handleDeleteGroup = async () => {
    if (!activeConversation || !window.confirm('Are you sure you want to delete this group? This cannot be undone.')) return;
    try {
      await api.delete(`/messages/groups/${activeConversation.id}/`);
      setShowGroupInfo(false);
      setShowHeaderMenu(false);
      setActiveConversation(null);
      await fetchConversations();
      navigate('/messages');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete group.');
    }
  };

  // Helper for participant details
  const getOtherParticipantDetail = (conv: Conversation) => {
    if (conv.is_group) {
      return {
        role: `${conv.members_count || conv.participants?.length || 0} Members`,
        subtitle: conv.group_admin_detail ? `Admin: ${conv.group_admin_detail.full_name}` : 'Group Chat'
      };
    }
    const other = conv.other_user;
    if (!other) return { role: 'Resident', subtitle: 'Hostel Resident' };

    let role = 'Resident';
    let subtitle = '';
    if (other.is_staff || other.is_superuser || other.is_hostel_admin) {
      role = 'Admin';
      subtitle = 'Hostel Administration';
    } else {
      role = 'Student';
      const parts = [];
      if (other.hostel_name) parts.push(other.hostel_name);
      if (other.room_number) parts.push(`Room ${other.room_number}`);
      subtitle = parts.join(' • ') || 'Hostel Resident';
    }

    return { role, subtitle };
  };

  // Background Style calculation for active chat stream
  const getActiveChatBackgroundStyle = (): React.CSSProperties => {
    const isDark = chatPreferences.theme_mode === 'dark';

    if (chatPreferences.bg_type === 'solid' && chatPreferences.bg_value) {
      return { backgroundColor: chatPreferences.bg_value };
    }
    if (chatPreferences.bg_type === 'gradient' && chatPreferences.bg_value) {
      return { background: chatPreferences.bg_value };
    }
    if (chatPreferences.bg_type === 'wallpaper' && chatPreferences.bg_value) {
      const wallpaper = WALLPAPER_OPTIONS.find(w => w.id === chatPreferences.bg_value);
      if (wallpaper) {
        return {
          backgroundImage: wallpaper.svgDataUrl,
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          backgroundRepeat: 'repeat',
        };
      }
    }
    if (chatPreferences.bg_type === 'custom') {
      const customUrl = chatPreferences.custom_bg_image_url || chatPreferences.custom_bg_image;
      if (customUrl) {
        return {
          backgroundImage: `url(${customUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'local',
        };
      }
    }
    return { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' };
  };

  // Bubble style classes for messages in the stream
  const getMessageBubbleClasses = (isMe: boolean) => {
    const style = chatPreferences.bubble_style || 'classic';
    const isDark = chatPreferences.theme_mode === 'dark';

    let classes = '';

    if (style === 'classic') {
      classes = isMe
        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-2xl rounded-br-xs shadow-xs'
        : isDark
        ? 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-2xl rounded-bl-xs shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-bl-xs shadow-xs';
    } else if (style === 'rounded') {
      classes = isMe
        ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-3xl shadow-sm'
        : isDark
        ? 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-3xl shadow-sm'
        : 'bg-white text-slate-800 border border-slate-200/90 rounded-3xl shadow-sm';
    } else if (style === 'minimal') {
      classes = isMe
        ? 'bg-brand-50/90 border-2 border-brand-600 text-brand-950 rounded-xl font-medium shadow-xs'
        : isDark
        ? 'bg-slate-800/90 border-2 border-slate-600 text-slate-100 rounded-xl font-medium shadow-xs'
        : 'bg-slate-50/95 border-2 border-slate-300 text-slate-900 rounded-xl font-medium shadow-xs';
    } else if (style === 'compact') {
      classes = isMe
        ? 'bg-brand-600 text-white rounded-lg p-2 text-[11px] shadow-xs'
        : isDark
        ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 text-[11px] shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200 rounded-lg p-2 text-[11px] shadow-xs';
    }

    return classes;
  };

  const directConversations = conversations.filter(c => !c.is_group);
  const groupConversations = conversations.filter(c => c.is_group);

  return (
    <div
      className="bg-white select-text relative flex flex-col md:flex-row w-full h-full min-h-0 overflow-hidden md:rounded-3xl md:border md:border-slate-200/80 md:shadow-sm"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Desktop Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-brand-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white border-4 border-dashed border-white/80 p-6 animate-in fade-in duration-150">
          <UploadCloud className="w-16 h-16 animate-bounce mb-3" />
          <h3 className="text-lg font-extrabold tracking-tight">Drop files to send</h3>
          <p className="text-xs text-white/80 mt-1">Photos, videos, or documents will be reviewed before sending</p>
        </div>
      )}

      {/* Left Conversations Sidebar */}
      <div
        className={`w-full md:w-80 lg:w-88 border-r border-slate-100 flex flex-col bg-white h-full min-h-0 overflow-hidden ${
          activeConversation && conversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Top Header & Tabs */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition cursor-pointer"
                title="Back to Home"
                aria-label="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">Messages</h2>
            </div>

            {activeTab === 'groups' && (
              <button
                type="button"
                onClick={() => setShowCreateGroup(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Group</span>
              </button>
            )}
          </div>

          {/* Direct vs Groups Toggle Tabs */}
          <div className="flex p-0.5 bg-slate-200/60 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Direct ({directConversations.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Groups ({groupConversations.length})</span>
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-1.5 min-h-0 overscroll-contain">
          {isLoadingConvs ? (
            <div className="p-4 space-y-3">
              <LoadingSkeleton count={4} />
            </div>
          ) : (activeTab === 'direct' ? directConversations : groupConversations).length > 0 ? (
            (activeTab === 'direct' ? directConversations : groupConversations).map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              const { subtitle } = getOtherParticipantDetail(conv);
              const isMenuOpen = activeConvMenuId === conv.id;

              return (
                <div key={conv.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      if (isConvLongPressActiveRef.current) {
                        isConvLongPressActiveRef.current = false;
                        return;
                      }
                      setActiveConversation(conv);
                      navigate(`/messages/${conv.id}`);
                    }}
                    onTouchStart={(e) => handleConvTouchStart(conv.id, e)}
                    onTouchMove={handleConvTouchMove}
                    onTouchEnd={handleConvTouchEnd}
                    onTouchCancel={handleConvTouchEnd}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActiveConvMenuId(isMenuOpen ? null : conv.id);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 relative cursor-pointer select-none ${
                      isSelected
                        ? 'bg-brand-50/90 text-slate-900 ring-1 ring-brand-200 shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {conv.is_group ? (
                        conv.group_avatar ? (
                          <img
                            src={getMediaUrl(conv.group_avatar)}
                            alt={conv.group_name}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {conv.group_name?.slice(0, 2).toUpperCase() || 'GP'}
                          </div>
                        )
                      ) : (conv.other_user?.profile?.avatar || conv.other_user?.profile_picture) ? (
                        <img
                          src={getMediaUrl(conv.other_user.profile?.avatar || conv.other_user.profile_picture)}
                          alt={conv.other_user.full_name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200 shadow-xs">
                          {conv.other_user?.first_name?.charAt(0) || 'U'}
                        </div>
                      )}

                      {!conv.is_group && conv.other_user?.gender && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-slate-100">
                          <GenderIcon gender={conv.other_user.gender} className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {conv.is_group ? conv.group_name : conv.other_user?.full_name || 'Resident'}
                        </h4>
                        {conv.last_message && (
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 truncate leading-snug">
                        {conv.last_message ? conv.last_message.content : subtitle}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {conv.unread_count > 0 && (
                      <span className="shrink-0 min-w-[18px] h-4.5 px-1 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>

                  {/* Desktop 3-Dot Hover Trigger Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveConvMenuId(isMenuOpen ? null : conv.id);
                    }}
                    className="hidden md:flex opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/70 transition absolute right-2.5 top-2.5 z-20 cursor-pointer"
                    title="Conversation options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Contextual Action Menu (WhatsApp/Instagram style) */}
                  {isMenuOpen && (
                    <>
                      {/* Backdrop to tap outside & close */}
                      <div
                        className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[0.5px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveConvMenuId(null);
                        }}
                      />

                      <div
                        className="absolute z-50 right-2 top-8 md:top-10 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 min-w-[160px] animate-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveConvMenuId(null);
                            setConvToDelete(conv);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              {activeTab === 'direct'
                ? 'No direct conversations yet. Reach out to hostel residents from Home or Marketplace.'
                : 'No private groups yet. Create your first hostel group!'}
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Panel */}
      {activeConversation ? (
        <div
          className={`flex-1 flex flex-col relative h-full min-h-0 overflow-hidden ${
            activeConversation && conversationId ? 'flex' : 'hidden md:flex'
          }`}
          style={getActiveChatBackgroundStyle()}
        >
          {/* Readability Overlay for Custom Photo Backgrounds */}
          {chatPreferences.bg_type === 'custom' && (chatPreferences.custom_bg_image_url || chatPreferences.custom_bg_image) && (
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] pointer-events-none z-0" />
          )}

          {/* WhatsApp-Style Chat Top Header */}
          <div className="p-3 sm:px-5 py-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between gap-2 shadow-xs z-20">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back to Chats button for Mobile - Properly resets active state & URL */}
              <button
                onClick={() => {
                  setActiveConversation(null);
                  navigate('/messages');
                }}
                className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                aria-label="Back to conversations list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Clickable Avatar & User Info -> Opens Profile Page or Group Details */}
              <button
                onClick={() => {
                  if (activeConversation.is_group) {
                    setShowGroupInfo(true);
                  } else if (activeConversation.other_user?.id) {
                    navigate(`/profile/${activeConversation.other_user.id}`);
                  }
                }}
                className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition group cursor-pointer"
                title={activeConversation.is_group ? "View Group Details" : "View Student Profile"}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {activeConversation.is_group ? (
                    activeConversation.group_avatar ? (
                      <img
                        src={getMediaUrl(activeConversation.group_avatar)}
                        alt={activeConversation.group_name}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:ring-2 group-hover:ring-brand-500/40 transition"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:ring-2 group-hover:ring-brand-500/40 transition">
                        {activeConversation.group_name?.slice(0, 2).toUpperCase() || 'GP'}
                      </div>
                    )
                  ) : (activeConversation.other_user?.profile?.avatar || activeConversation.other_user?.profile_picture) ? (
                    <img
                      src={getMediaUrl(activeConversation.other_user.profile?.avatar || activeConversation.other_user.profile_picture)}
                      alt={activeConversation.other_user.full_name}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:ring-2 group-hover:ring-brand-500/40 transition"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200 shadow-xs group-hover:ring-2 group-hover:ring-brand-500/40 transition">
                      {activeConversation.other_user?.first_name?.charAt(0) || 'U'}
                    </div>
                  )}

                  {!activeConversation.is_group && activeConversation.other_user?.gender && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-slate-100">
                      <GenderIcon gender={activeConversation.other_user.gender} className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Title & Subtitle */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-brand-600 transition truncate">
                      {activeConversation.is_group
                        ? activeConversation.group_name
                        : activeConversation.other_user?.full_name || 'Resident'}
                    </h3>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                    {getOtherParticipantDetail(activeConversation).subtitle}
                  </p>
                </div>
              </button>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1 shrink-0 relative">
              {/* Three-Dot Menu Button */}
              <button
                type="button"
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                title="Conversation Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Header Dropdown Menu */}
              {showHeaderMenu && (
                <div
                  ref={headerMenuRef}
                  className="absolute top-12 right-0 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-40 space-y-1 animate-in zoom-in-95 duration-100"
                >
                  {/* Customize Chat Option */}
                  <button
                    onClick={() => {
                      setShowHeaderMenu(false);
                      setShowCustomizationModal(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl flex items-center gap-2.5 transition"
                  >
                    <Palette className="w-4 h-4 text-brand-600" />
                    <span>Customize Chat</span>
                  </button>

                  {/* Direct Chat: View Profile */}
                  {!activeConversation.is_group && activeConversation.other_user && (
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        navigate(`/profile/${activeConversation.other_user!.id}`);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>View Profile</span>
                    </button>
                  )}

                  {/* Group Info Option */}
                  {activeConversation.is_group && (
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShowGroupInfo(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Group Details</span>
                    </button>
                  )}

                  {/* Add Members (for group admin) */}
                  {activeConversation.is_group && activeConversation.is_admin && (
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setShowAddMembersModal(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition"
                    >
                      <UserPlus className="w-4 h-4 text-slate-400" />
                      <span>Add Members</span>
                    </button>
                  )}

                  {/* Direct Chat: Report User */}
                  {!activeConversation.is_group && activeConversation.other_user && (
                    <button
                      onClick={() => {
                        setShowHeaderMenu(false);
                        setReportingTarget({
                          type: 'user',
                          id: activeConversation.other_user!.id.toString(),
                          title: activeConversation.other_user!.full_name,
                        });
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition"
                    >
                      <Flag className="w-4 h-4 text-rose-400" />
                      <span>Report User</span>
                    </button>
                  )}

                  {/* Direct Chat: Block / Unblock User */}
                  {!activeConversation.is_group && activeConversation.other_user && (
                    (activeConversation.is_blocked_by_me || activeConversation.other_user?.is_blocked_by_me) ? (
                      <button
                        onClick={() => {
                          setShowHeaderMenu(false);
                          setShowUnblockConfirmModal(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-2.5 transition"
                      >
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Unblock User</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowHeaderMenu(false);
                          setShowBlockConfirmModal(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition"
                      >
                        <Ban className="w-4 h-4 text-rose-500" />
                        <span>Block User</span>
                      </button>
                    )
                  )}

                  {/* Group: Leave / Delete Options */}
                  {activeConversation.is_group && (
                    <>
                      <button
                        onClick={handleLeaveGroup}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl flex items-center gap-2.5 transition"
                      >
                        <LogOut className="w-4 h-4 text-amber-500" />
                        <span>Leave Group</span>
                      </button>

                      {activeConversation.is_admin && (
                        <button
                          onClick={handleDeleteGroup}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                          <span>Delete Group</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Messages Flow Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 relative z-10">
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isMe = msg.is_me;
                const showMenu = activeMessageMenuId === msg.id;
                const isHighlighted = highlightedMessageId === msg.id;
                const isEmojiOnly = isEmojiOnlyMessage(msg.content) && msg.message_type === 'text' && !msg.file && !msg.reply_to_detail;

                return (
                  <div
                    key={msg.id}
                    id={`message-item-${msg.id}`}
                    className={`flex flex-col group relative transition-all duration-300 ${
                      isMe ? 'items-end' : 'items-start'
                    } ${isHighlighted ? 'scale-[1.02] p-1.5 bg-brand-200/30 rounded-2xl ring-2 ring-brand-400' : ''}`}
                  >
                    {/* Group Sender Name */}
                    {activeConversation.is_group && !isMe && msg.sender_detail && (
                      <span className="text-[10px] font-bold text-brand-600 ml-3 mb-0.5">
                        {msg.sender_detail.full_name}
                      </span>
                    )}

                    {/* Bubble & Action Triggers */}
                    <div
                      className="flex items-end gap-1.5 max-w-[88%] sm:max-w-[75%] relative select-none sm:select-text"
                      onTouchStart={(e) => handleTouchStart(msg.id, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                    >
                      {/* Left action trigger for sent messages on Desktop */}
                      {isMe && !msg.is_deleted_everyone && (
                        <button
                          type="button"
                          onClick={() => setActiveMessageMenuId(showMenu ? null : msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition shrink-0"
                          title="Message options"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Emoji-Only Message Presentation (Enlarged) */}
                      {isEmojiOnly ? (
                        <div className="p-1 select-none text-4xl sm:text-5xl leading-tight hover:scale-110 transition-transform">
                          <span>{msg.content}</span>
                          <span className={`block text-[9px] font-medium mt-0.5 text-right ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`p-3.5 text-xs leading-relaxed transition-all relative ${getMessageBubbleClasses(isMe)}`}
                        >
                          {/* WhatsApp-Style Quoted Reply Preview */}
                          {msg.reply_to_detail && (
                            <div
                              onClick={() => scrollToMessage(msg.reply_to_detail!.id)}
                              className={`mb-2.5 p-2 rounded-xl text-[11px] border-l-4 cursor-pointer transition hover:opacity-90 ${
                                isMe
                                  ? 'bg-white/15 border-white text-white/95'
                                  : 'bg-slate-100 border-brand-600 text-slate-700'
                              }`}
                            >
                              <span className="font-bold block text-[10px] opacity-90">
                                {msg.reply_to_detail.sender_name}
                              </span>
                              <span className="truncate block opacity-85">
                                {msg.reply_to_detail.content || (msg.reply_to_detail.message_type === 'image' ? '📷 Photo' : '📄 Attachment')}
                              </span>
                            </div>
                          )}

                          {/* Deleted Message Notice */}
                          {msg.is_deleted_everyone ? (
                            <p className="italic text-slate-400 flex items-center gap-1.5">
                              <span>🚫 This message was deleted</span>
                            </p>
                          ) : (
                            <>
                              {/* 1. Image Attachment with Lightbox */}
                              {msg.message_type === 'image' && msg.file && (
                                <div className="mb-2 rounded-2xl overflow-hidden cursor-pointer group/img relative bg-black/5 shadow-xs">
                                  <img
                                    src={msg.file}
                                    alt={msg.file_name || 'Photo'}
                                    onClick={() => {
                                      if (isLongPressActiveRef.current) return;
                                      setLightboxImage({
                                        src: msg.file!,
                                        sender: msg.sender_detail?.full_name,
                                        time: new Date(msg.created_at).toLocaleString()
                                      });
                                    }}
                                    className="max-h-72 w-full object-cover rounded-2xl hover:opacity-95 transition"
                                  />
                                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition">
                                    <Eye className="w-6 h-6 text-white drop-shadow-md" />
                                  </div>
                                </div>
                              )}

                              {/* 2. Video Attachment with Inline Player */}
                              {msg.message_type === 'video' && msg.file && (
                                <div className="mb-2 rounded-2xl overflow-hidden bg-black shadow-xs">
                                  <video
                                    src={msg.file}
                                    controls
                                    className="max-h-72 w-full rounded-2xl"
                                  />
                                </div>
                              )}

                              {/* 3. Audio Voice Note */}
                              {msg.message_type === 'audio' && msg.file && (
                                <div className="mb-2 flex items-center gap-2 p-2 rounded-2xl bg-black/5">
                                  <audio src={msg.file} controls className="h-8 max-w-full" />
                                </div>
                              )}

                              {/* 4. Document / PDF / File Card */}
                              {msg.message_type === 'file' && msg.file && (
                                <div
                                  className={`mb-2.5 p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${
                                    isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                        getFileCardMeta(msg.file_name || '').color
                                      }`}
                                    >
                                      {getFileCardMeta(msg.file_name || '').badge}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-xs truncate max-w-xs">{msg.file_name || 'Document'}</p>
                                      <div className="flex items-center gap-1.5 text-[10px] opacity-75 mt-0.5">
                                        <span>{formatFileSize(msg.file_size)}</span>
                                        <span>•</span>
                                        <span>{getFileCardMeta(msg.file_name || '').label}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <a
                                    href={msg.file}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      if (isLongPressActiveRef.current) e.preventDefault();
                                    }}
                                    className={`p-2 rounded-xl transition shrink-0 ${
                                      isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-brand-50 hover:bg-brand-100 text-brand-600'
                                    }`}
                                    title="Download File"
                                  >
                                    <FileDown className="w-4 h-4" />
                                  </a>
                                </div>
                              )}

                              {/* Message Text Content */}
                              {msg.content && (
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              )}
                            </>
                          )}

                          {/* Timestamp & Status Indicator */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-medium ${
                              isMe ? 'text-white/75' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              msg.is_read ? (
                                <CheckCheck className="w-3 h-3 text-cyan-200" />
                              ) : (
                                <Check className="w-3 h-3 text-white/70" />
                              )
                            )}
                          </div>

                          {/* Reaction Badges underneath bubble */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="absolute -bottom-3 right-2 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-full shadow-xs border border-slate-200 text-[10px]">
                              {msg.reactions.map((r, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleReaction(msg.id, r.emoji)}
                                  className={`flex items-center gap-0.5 px-1 py-0.2 rounded-full transition ${
                                    r.user_reacted ? 'bg-brand-50 text-brand-600 font-bold' : 'hover:bg-slate-100 text-slate-700'
                                  }`}
                                  title={r.users.join(', ')}
                                >
                                  <span>{r.emoji}</span>
                                  {r.count > 1 && <span className="text-[9px] font-semibold text-slate-600">{r.count}</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Right action trigger for received messages on Desktop */}
                      {!isMe && !msg.is_deleted_everyone && (
                        <button
                          type="button"
                          onClick={() => setActiveMessageMenuId(showMenu ? null : msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition shrink-0"
                          title="Message options"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Popover Action Menu */}
                    {showMenu && (
                      <>
                        {/* Fullscreen Backdrop to dismiss menu on tap anywhere */}
                        <div
                          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[0.5px] animate-in fade-in duration-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMessageMenuId(null);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            setActiveMessageMenuId(null);
                          }}
                        />

                        <div
                          className={`absolute z-50 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 min-w-[200px] max-w-[calc(100vw-3rem)] animate-in zoom-in-95 duration-100 ${
                            isMe ? 'right-0' : 'left-0'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        >
                          {/* Quick Reaction Bar */}
                          <div className="flex items-center justify-around p-1 border-b border-slate-100 mb-1 text-base">
                            {QUICK_REACTION_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReaction(msg.id, emoji);
                                }}
                                className="p-1.5 hover:bg-slate-100 rounded-xl transition active:scale-125 cursor-pointer text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          {/* Reply Action */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyingTo(msg);
                              setActiveMessageMenuId(null);
                              messageInputRef.current?.focus();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-semibold transition cursor-pointer"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5 text-slate-400" />
                            <span>Reply</span>
                          </button>

                          {/* Copy Action */}
                          {msg.content && !msg.is_deleted_everyone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyMessage(msg.content, msg.id);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-semibold transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>{copiedFeedbackId === msg.id ? 'Copied! ✓' : 'Copy Text'}</span>
                            </button>
                          )}

                          {/* Delete Action (opens confirmation) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMessageMenuId(null);
                              setMessageToDelete(msg);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete...</span>
                          </button>

                          {/* Report Action (for messages sent by other user) */}
                          {!isMe && !msg.is_deleted_everyone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMessageMenuId(null);
                                setReportingTarget({
                                  type: 'user',
                                  id: msg.sender.toString(),
                                  title: msg.sender_detail?.full_name || 'Resident',
                                });
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-semibold transition cursor-pointer"
                            >
                              <Flag className="w-3.5 h-3.5 text-slate-400" />
                              <span>Report</span>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  title="Say Hello!"
                  message="Start this conversation with a greeting or message."
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky WhatsApp-Style Bottom Area (Composer or Blocked Banner) */}
          <div className="bg-white border-t border-slate-200/80 relative z-20 shadow-md">
            {!activeConversation.is_group && (activeConversation.is_blocked_by_me || activeConversation.other_user?.is_blocked_by_me) ? (
              <div className="p-4 sm:p-5 bg-slate-50/95 flex flex-col items-center justify-center text-center space-y-2">
                <div className="flex items-center gap-1.5 text-slate-800 text-xs sm:text-sm font-bold">
                  <Ban className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>You blocked {activeConversation.other_user?.full_name || 'this user'}.</span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  You won't receive messages from this person. Unblock them to resume messaging.
                </p>
                <button
                  type="button"
                  onClick={() => setShowUnblockConfirmModal(true)}
                  className="mt-1 px-5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unblock</span>
                </button>
              </div>
            ) : (
              <div className="p-3 sm:p-4 space-y-2">
                {/* Replying Banner */}
                {replyingTo && (
                  <div className="flex items-center justify-between p-2.5 bg-brand-50/90 border border-brand-200 rounded-2xl text-xs animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <CornerUpLeft className="w-4 h-4 text-brand-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-brand-700 block text-[11px]">
                          Replying to {replyingTo.sender_detail?.full_name || 'Resident'}
                        </span>
                        <span className="text-slate-600 truncate block text-[11px]">
                          {replyingTo.content || (replyingTo.message_type === 'image' ? '📷 Photo' : '📄 Attachment')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2 relative">
                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFileForComposer(e.target.files[0]);
                      setShowAttachmentMenu(false);
                    }}
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFileForComposer(e.target.files[0]);
                      setShowAttachmentMenu(false);
                    }}
                  />
                  <input
                    type="file"
                    ref={docInputRef}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFileForComposer(e.target.files[0]);
                      setShowAttachmentMenu(false);
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFileForComposer(e.target.files[0]);
                      setShowAttachmentMenu(false);
                    }}
                  />

                  {/* 1. Emoji Button with Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowAttachmentMenu(false);
                      }}
                      className={`p-2.5 rounded-2xl transition-all duration-200 ${
                        showEmojiPicker
                          ? 'bg-brand-50 text-brand-600 ring-2 ring-brand-200'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Insert Emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Emoji Picker Popover */}
                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute bottom-14 left-0 sm:-left-2 z-40 max-w-[calc(100vw-2rem)]"
                      >
                        <EmojiPicker
                          onSelectEmoji={(emoji) => {
                            setMessageInput((prev) => prev + emoji);
                          }}
                          onClose={() => setShowEmojiPicker(false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Attachment Button '+' with Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachmentMenu(!showAttachmentMenu);
                        setShowEmojiPicker(false);
                      }}
                      className={`p-2.5 rounded-2xl transition-all duration-200 ${
                        showAttachmentMenu
                          ? 'bg-brand-600 text-white rotate-45'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Attach Media or Documents"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Attachment Menu Popover */}
                    {showAttachmentMenu && (
                      <div
                        ref={attachmentMenuRef}
                        className="absolute bottom-14 left-0 bg-white rounded-3xl shadow-xl border border-slate-200/90 p-3 min-w-[210px] z-40 space-y-1 animate-in slide-in-from-bottom-2 duration-150"
                      >
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition text-xs font-semibold text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <span>Photos & Images</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-purple-50 text-slate-700 hover:text-purple-600 transition text-xs font-semibold text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Video className="w-4 h-4" />
                          </div>
                          <span>Videos & Clips</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => docInputRef.current?.click()}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 transition text-xs font-semibold text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span>Documents & PDFs</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-amber-50 text-slate-700 hover:text-amber-600 transition text-xs font-semibold text-left"
                        >
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <span>Any File</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3. Text Message Input */}
                  <div className="flex-1 relative">
                    <textarea
                      ref={messageInputRef}
                      rows={1}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none resize-none max-h-28 placeholder:text-slate-400 transition leading-relaxed"
                    />
                  </div>

                  {/* 4. Permanent Stable Send Button */}
                  <button
                    type="submit"
                    disabled={isSending || !messageInput.trim()}
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-2xl shadow-sm shadow-brand-500/20 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title="Send message"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-50/80 via-indigo-50/20 to-slate-50 relative overflow-hidden">
          <div className="absolute w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -top-20 -right-20" />
          <div className="absolute w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -bottom-20 -left-20" />

          <div className="relative z-10 max-w-md space-y-6 flex flex-col items-center">
            {/* Animated Emblem */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/25 border-2 border-white">
                <Send className="w-9 h-9 translate-x-0.5 -translate-y-0.5" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-xs">
                ✓
              </span>
            </div>

            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-[11px] font-bold border border-brand-200/80">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>HostelTalkies Direct Messenger</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Your Campus Conversations
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Select a direct chat or hostel group from the left panel to discuss marketplace listings, study materials, or connect with roommates.
              </p>
            </div>

            {/* Feature Highlights Matrix */}
            <div className="grid grid-cols-2 gap-2.5 w-full text-left pt-2">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🔒 Privacy</span>
                <span className="text-xs font-bold text-slate-800 block">Hostel Verified</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⚡ Delivery</span>
                <span className="text-xs font-bold text-slate-800 block">Instant Live Chat</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">📎 Sharing</span>
                <span className="text-xs font-bold text-slate-800 block">Notes, PYQs &amp; Media</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🎨 Themes</span>
                <span className="text-xs font-bold text-slate-800 block">Custom Wallpapers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Review & Composer Modal */}
      <AttachmentComposerModal
        file={selectedFileForComposer}
        isOpen={Boolean(selectedFileForComposer)}
        isSending={isSending}
        onSend={handleSendAttachment}
        onClose={() => setSelectedFileForComposer(null)}
      />

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          isOpen={Boolean(lightboxImage)}
          src={lightboxImage.src}
          senderName={lightboxImage.sender}
          timestamp={lightboxImage.time}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {/* Chat Customization Modal */}
      {showCustomizationModal && (
        <ChatCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          conversationId={activeConversation?.id}
          conversationName={activeConversation?.is_group ? activeConversation.group_name : activeConversation?.other_user?.full_name}
          initialPreferences={chatPreferences}
          onSavePreferences={(updated) => {
            setChatPreferences(updated);
            if (activeConversation) {
              localStorage.setItem(`ht_chat_pref_${user?.id}_${activeConversation.id}`, JSON.stringify(updated));
            }
          }}
        />
      )}

      {/* Report Modal */}
      {reportingTarget && (
        <ReportModal
          reportType={reportingTarget.type}
          targetId={reportingTarget.id}
          targetTitle={reportingTarget.title}
          onClose={() => setReportingTarget(null)}
        />
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowCreateGroup(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Create Private Group</h3>
              </div>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="p-6 space-y-4 overflow-y-auto">
              {createGroupError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {createGroupError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Block A Badminton Champs"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none"
                />
              </div>

              {/* Group Avatar Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Group Icon (Optional)</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Group avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition">
                    <span>{newGroupAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          setNewGroupAvatar(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>


              {/* Add Members Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Add Members</label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search students by name or email..."
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto divide-y divide-slate-50 border border-slate-200 rounded-xl p-1">
                  {isSearchingMembers ? (
                    <div className="p-4 text-center text-xs text-slate-400">Searching students...</div>
                  ) : availableMembers.length > 0 ? (
                    availableMembers.map((m) => {

                    const isSelected = selectedMemberIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMemberIds(prev =>
                            isSelected ? prev.filter(id => id !== m.id) : [...prev, m.id]
                          );
                        }}
                        className={`w-full p-2 rounded-lg flex items-center justify-between text-xs transition ${
                          isSelected ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                            {m.first_name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-semibold truncate">{m.full_name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No students found.
                  </div>
                )}
                </div>
              </div>


              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup || !newGroupName.trim()}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Members to Existing Group Modal */}
      {showAddMembersModal && activeConversation && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddMembersModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Add Members to {activeConversation.group_name}</h3>
              </div>
              <button
                onClick={() => setShowAddMembersModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMembersSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={addMemberSearchQuery}
                  onChange={(e) => setAddMemberSearchQuery(e.target.value)}
                  placeholder="Search students to add..."
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-50 border border-slate-200 rounded-xl p-1">
                {addAvailableMembers.length > 0 ? (
                  addAvailableMembers.map((m) => {
                    const isSelected = addSelectedMemberIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setAddSelectedMemberIds(prev =>
                            isSelected ? prev.filter(id => id !== m.id) : [...prev, m.id]
                          );
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs transition ${
                          isSelected ? 'bg-brand-50 text-brand-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                            {m.first_name?.charAt(0) || 'U'}
                          </div>
                          <div className="text-left truncate">
                            <span className="font-semibold block truncate">{m.full_name}</span>
                            <span className="text-[10px] text-slate-400">{m.hostel_name || 'Hostel Resident'}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new students found to add.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMembersModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMembers || addSelectedMemberIds.length === 0}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {isAddingMembers ? 'Adding...' : `Add Selected (${addSelectedMemberIds.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Info / Members Details Modal */}
      {showGroupInfo && activeConversation && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowGroupInfo(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Group Details</h3>
              </div>
              <button
                onClick={() => setShowGroupInfo(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="flex flex-col items-center text-center space-y-2">
                {activeConversation.group_avatar ? (
                  <img
                    src={activeConversation.group_avatar}
                    alt={activeConversation.group_name}
                    className="w-20 h-20 rounded-3xl object-cover border-2 border-slate-200 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                    {activeConversation.group_name?.slice(0, 2).toUpperCase() || 'GP'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{activeConversation.group_name}</h4>
                  <p className="text-xs text-slate-500">{activeConversation.participants?.length || 0} Members • Private Hostel Group</p>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Group Members</span>
                  {activeConversation.is_admin && (
                    <button
                      onClick={() => {
                        setShowGroupInfo(false);
                        setShowAddMembersModal(true);
                      }}
                      className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-1 max-h-48 overflow-y-auto">
                  {activeConversation.participants_detail?.map((p) => {
                    const isGroupAdmin = p.id === activeConversation.group_admin;
                    return (
                      <div key={p.id} className="p-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] overflow-hidden shrink-0">
                            {(p.profile?.avatar || p.profile_picture) ? (
                              <img
                                src={getMediaUrl(p.profile?.avatar || p.profile_picture)}
                                alt={p.full_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>{p.first_name?.charAt(0) || 'U'}</span>
                            )}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-slate-800 truncate block">{p.full_name}</span>
                            <span className="text-[10px] text-slate-400">{p.hostel_name || 'Resident'}</span>
                          </div>
                        </div>

                        {isGroupAdmin ? (
                          <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-bold text-[10px] flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowGroupInfo(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Confirmation Modal in Chat */}
      {showBlockConfirmModal && activeConversation?.other_user && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isProcessingBlock && setShowBlockConfirmModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Block {activeConversation.other_user.full_name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Blocked users won't be able to message you or start new conversations. You can unblock them at any time.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockConfirmModal(false)}
                disabled={isProcessingBlock}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockUserInChat}
                disabled={isProcessingBlock}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {isProcessingBlock ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock User Confirmation Modal in Chat */}
      {showUnblockConfirmModal && activeConversation?.other_user && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isProcessingBlock && setShowUnblockConfirmModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Unblock {activeConversation.other_user.full_name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                They will be able to send you messages and start conversations.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnblockConfirmModal(false)}
                disabled={isProcessingBlock}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnblockUserInChat}
                disabled={isProcessingBlock}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {isProcessingBlock ? 'Unblocking...' : 'Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {messageToDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeletingMessage && setMessageToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Delete message?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {messageToDelete.is_me || activeConversation?.is_admin
                  ? 'Choose whether to delete this message for everyone or only for yourself.'
                  : 'This message will be removed from your chat history.'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {(messageToDelete.is_me || activeConversation?.is_admin) && !messageToDelete.is_deleted_everyone && (
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(messageToDelete.id, 'for_everyone')}
                  disabled={isDeletingMessage}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete for everyone</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDeleteMessage(messageToDelete.id, 'for_me')}
                disabled={isDeletingMessage}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition active:scale-95 disabled:opacity-50"
              >
                Delete for me
              </button>

              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                disabled={isDeletingMessage}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conversation Confirmation Dialog (Conversation Level) */}
      {convToDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isDeletingConv && setConvToDelete(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Delete conversation?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete this conversation?
              </p>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed text-left">
              This will remove the conversation from your Messages list. The other user's profile and account will remain completely unaffected.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConvToDelete(null)}
                disabled={isDeletingConv}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConversation}
                disabled={isDeletingConv}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isDeletingConv ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
