//src/components/common/DynamicIcon.tsx
import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';

const ICON_FAMILIES: Record<string, any> = {
    Ionicons,
    FontAwesome5,
    MaterialIcons,
    MaterialCommunityIcons,
    Feather,
    AntDesign
};

interface DynamicIconProps {
    iconString?: string;
    size?: number;
    color?: string;
    style?: ViewStyle | TextStyle;
}

export default function DynamicIcon({ 
    iconString, 
    size = 24, 
    color = colors.white, 
    style 
}: DynamicIconProps) {
    
    const FallbackIcon = () => (
        <Ionicons name="help-circle-outline" size={size} color={color} style={style as any} />
    );

    if (!iconString) return <FallbackIcon />;

    if (iconString.includes(':') || iconString.includes('/')) {
        const separator = iconString.includes(':') ? ':' : '/';
        const parts = iconString.split(separator);
        
        if (parts.length !== 2) return <FallbackIcon />;

        const familyName = parts[0];
        const iconName = parts[1];
        const IconComponent = ICON_FAMILIES[familyName];

        if (!IconComponent) return <FallbackIcon />;

        const isValidIcon = IconComponent.glyphMap && IconComponent.glyphMap[iconName] !== undefined;

        if (!isValidIcon) return <FallbackIcon />;

        return <IconComponent name={iconName} size={size} color={color} style={style as any} />;
    }

    // Le conteneur s'adapte dynamiquement pour toujours parfaitement encadrer l'emoji
    const containerSize = size * 1.4;

    return (
        <View style={[
            styles.glassContainer, 
            { 
                width: containerSize, 
                height: containerSize, 
                borderRadius: containerSize / 3 
            },
            style as ViewStyle
        ]}>
            <Text style={{ fontSize: size, includeFontPadding: false, textAlign: 'center' }}>
                {iconString}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    glassContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(255, 255, 255, 0.5)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    }
});