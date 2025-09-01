#!/bin/bash

# Script para aplicar regras de desenvolvimento no Firestore
# ATENÇÃO: Apenas para desenvolvimento local!

echo "🔥 Aplicando regras de desenvolvimento no Firestore..."
echo "⚠️  ATENÇÃO: Essas regras são INSEGURAS e só devem ser usadas em desenvolvimento!"

# Verificar se firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools"
    exit 1
fi

# Fazer backup das regras originais
echo "💾 Fazendo backup das regras originais..."
cp firestore.rules firestore.rules.backup

# Aplicar regras de desenvolvimento
echo "🔧 Aplicando regras de desenvolvimento..."
cp firestore-dev.rules firestore.rules

# Deploy das regras
echo "🚀 Fazendo deploy das regras..."
firebase deploy --only firestore:rules --project entomonitec

echo "✅ Regras de desenvolvimento aplicadas!"
echo "📝 Para restaurar as regras originais, execute: ./scripts/restore-prod-rules.sh"
