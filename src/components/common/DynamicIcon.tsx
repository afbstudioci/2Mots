import React from 'react';
import { AntDesign, Feather, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

interface DynamicIconProps {
    iconString: string; // Format "Famille:NomIcone" ex: "MaterialCommunityIcons:food-apple"
    size?: number;
    color?: string;
}

export default function DynamicIcon({ iconString, size = 24, color = '#000' }: DynamicIconProps) {
    if (!iconString || !iconString.includes(':')) {
        return <Ionicons name="help-circle-outline" size={size} color={color} />;
    }

    const [family, name] = iconString.split(':');

    // Le 'as any' est obligatoire ici car TypeScript ne peut pas valider 
    // une chaîne dynamique contre les milliers de noms d'icones possibles.
    // Notre backend garantit que le nom est correct grâce au dictionnaire.
    switch (family) {
        case 'AntDesign':
            return <AntDesign name={name as any} size={size} color={color} />;
        case 'Feather':
            return <Feather name={name as any} size={size} color={color} />;
        case 'FontAwesome5':
            return <FontAwesome5 name={name as any} size={size} color={color} />;
        case 'Ionicons':
            return <Ionicons name={name as any} size={size} color={color} />;
        case 'MaterialCommunityIcons':
            return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
        case 'MaterialIcons':
            return <MaterialIcons name={name as any} size={size} color={color} />;
        default:
            return <Ionicons name="help-circle-outline" size={size} color={color} />;
    }
}