#!/bin/bash

# Script para restaurar regras de produção no Firestore

echo "🔒 Restaurando regras de produção no Firestore..."

# Verificar se existe backup
if [ ! -f "firestore.rules.backup" ]; then
    echo "❌ Backup das regras não encontrado!"
    exit 1
fi

# Restaurar regras originais
echo "🔧 Restaurando regras originais..."
cp firestore.rules.backup firestore.rules

# Deploy das regras
echo "🚀 Fazendo deploy das regras..."
firebase deploy --only firestore:rules --project entomonitec

echo "✅ Regras de produção restauradas!"
