# Script de Configuracao do Repositorio Git
# Execute este script no PowerShell

Write-Host "Verificando configuracao do Git..." -ForegroundColor Cyan

# Verificar se o repositorio local esta OK
Write-Host "`nStatus do repositorio local:" -ForegroundColor Yellow
git status --short

# Verificar commits
$commits = git log --oneline | Measure-Object -Line
Write-Host "`nCommits locais: $($commits.Lines)" -ForegroundColor Green

# Verificar remote
Write-Host "`nRemote configurado:" -ForegroundColor Yellow
git remote -v

Write-Host "`nO repositorio remoto nao foi encontrado no GitHub." -ForegroundColor Red
Write-Host "`nOpcoes disponiveis:" -ForegroundColor Cyan
Write-Host "1. Criar o repositorio manualmente no GitHub" -ForegroundColor White
Write-Host "2. Usar um repositorio pessoal temporario" -ForegroundColor White
Write-Host "3. Verificar autenticacao do GitHub" -ForegroundColor White

Write-Host "`nPara criar o repositorio:" -ForegroundColor Yellow
Write-Host "   Acesse: https://github.com/organizations/gestsiloapp/repositories/new" -ForegroundColor White
Write-Host "   Nome: gestsilo" -ForegroundColor White
Write-Host "   Depois execute: git push -u origin main" -ForegroundColor White
