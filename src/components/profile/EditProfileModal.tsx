//src/components/profile/EditProfileModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AuthInput from '../auth/AuthInput';
import CustomAlert from '../common/CustomAlert';
import { spacing, borderRadius, typography } from '../../theme/theme';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const { themeColors } = useTheme();

  const [login, setLogin] = useState(user?.login || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({
    visible: false, title: '', message: '', type: 'error'
  });

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setAlert({ visible: true, title: 'Permission refusée', message: 'Nous avons besoin d\'accéder à vos photos.', type: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      if (login !== user?.login) formData.append('login', login);
      if (email !== user?.email) formData.append('email', email);
      
      if (newPassword) {
        if (!currentPassword) {
          throw new Error("Le mot de passe actuel est requis pour le modifier.");
        }
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }

      if (avatarUri) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append('avatar', {
          uri: Platform.OS === 'ios' ? avatarUri.replace('file://', '') : avatarUri,
          name: filename,
          type
        } as any);
      }

      await updateProfile(formData);
      setAlert({ visible: true, title: 'Succès', message: 'Profil mis à jour avec succès.', type: 'success' });
      setTimeout(() => {
        setAlert(prev => ({ ...prev, visible: false }));
        onClose();
      }, 1500);

    } catch (error: any) {
      setAlert({ visible: true, title: 'Erreur', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = avatarUri || user?.avatar;

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={true} 
      onRequestClose={onClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={[styles.modalContent, { backgroundColor: themeColors.background }]}
        >
          <View style={[styles.header, { borderBottomColor: themeColors.overlayLight }]}>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Text style={[styles.cancelText, { color: themeColors.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: themeColors.text }]}>Modifier</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text style={[styles.saveText, { color: themeColors.primary }]}>Enregistrer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity style={styles.avatarSection} onPress={handlePickImage} disabled={loading}>
              <View style={[styles.avatarContainer, { borderColor: themeColors.primary }]}>
                {displayAvatar ? (
                  <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarTextPlaceholder, { color: themeColors.primary }]}>
                    {login.charAt(0).toUpperCase()}
                  </Text>
                )}
                <View style={[styles.editIconBadge, { backgroundColor: themeColors.primary, borderColor: themeColors.background }]}>
                  <Ionicons name="camera" size={14} color="#FFF" />
                </View>
              </View>
              <Text style={[styles.changePhotoText, { color: themeColors.primary }]}>Changer la photo</Text>
            </TouchableOpacity>

            <View style={styles.formSection}>
              <AuthInput label="Pseudo" value={login} onChangeText={setLogin} placeholder="Votre pseudo" />
              <AuthInput label="Email" value={email} onChangeText={setEmail} placeholder="votre@email.com" keyboardType="email-address" />
              
              <View style={styles.passwordSection}>
                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Sécurité (Optionnel)</Text>
                <AuthInput label="Mot de passe actuel" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Requis si modification" isPassword />
                <AuthInput label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} placeholder="Nouveau mot de passe" isPassword />
              </View>
            </View>
          </ScrollView>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          )}

          <CustomAlert 
            visible={alert.visible} 
            title={alert.title} 
            message={alert.message} 
            type={alert.type} 
            onClose={() => setAlert(prev => ({ ...prev, visible: false }))} 
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  
  // CORRECTION : L'ancrage absolu
  modalContent: { 
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: '90%', 
      borderTopLeftRadius: borderRadius.xl, 
      borderTopRightRadius: borderRadius.xl, 
      paddingHorizontal: spacing.lg, 
      paddingBottom: spacing.xxl + 20,
  },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, marginBottom: spacing.md },
  cancelText: { ...typography.bodyMedium, fontSize: 16 },
  title: { ...typography.titleMedium, fontSize: 18 },
  saveText: { ...typography.buttonPrimary, fontSize: 16 },
  scrollContent: { paddingBottom: spacing.xxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.md },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarTextPlaceholder: { fontSize: 40, fontFamily: 'Lexend-Bold' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  changePhotoText: { marginTop: spacing.sm, ...typography.bodyMedium, fontSize: 14 },
  formSection: { width: '100%' },
  passwordSection: { marginTop: spacing.lg },
  sectionTitle: { ...typography.bodySmall, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl }
});