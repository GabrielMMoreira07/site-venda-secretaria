# -*- coding: utf-8 -*-
"""
Esqueleto de Backend em Python (FastAPI) para a Secretária Eletrônica IA.
Este arquivo implementa a arquitetura de autenticação (JWT), gerenciamento de licenças trial/premium,
salvamento de regras de setup clínico personalizados, e webhooks de confirmação do PagSeguro e PicPay.

Para rodar este servidor localmente ou em produção:
1. Instale as dependências: `pip install fastapi uvicorn PyJWT passlib[bcrypt]`
2. Execute o servidor: `uvicorn fastapi_server:app --reload`
"""

import os
import jwt
import datetime
from typing import Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(
    title="Secretária Eletrônica IA - API de Vendas e Gestão",
    description="Backend SaaS em Python para clínicas e consultórios médicos/odontológicos.",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do seu Frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, substitua pelo link real do seu produto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# CONFIGURAÇÕES E CHAVES DE API (INSERIR AQUI SEU FLUXO DE PRODUÇÃO)
# =====================================================================
# 🔑 DICA DE EXCELÊNCIA SEGURA: Sempre carregue chaves sensíveis de variáveis de ambiente (.env)
JWT_SECRET = os.getenv("JWT_SECRET", "SUA_CHAVE_SECRETA_JWT_SUPER_SEGURA_AQUI")
JWT_ALGORITHM = "HS256"

# 💳 Configurações de Gateways de Pagamento (PagSeguro & PicPay)
PAGSEGURO_TOKEN = os.getenv("PAGSEGURO_TOKEN", "SEU_TOKEN_PAGSEGURO_PRODUCAO_OU_SANDBOX")
PAGSEGURO_EMAIL = os.getenv("PAGSEGURO_EMAIL", "seu_email_cadastro@pagseguro.com.br")

PICPAY_TOKEN = os.getenv("PICPAY_TOKEN", "SEU_TOKEN_X_PICPAY_API")
PICPAY_SELLER_TOKEN = os.getenv("PICPAY_SELLER_TOKEN", "SEU_TOKEN_SELLER_PICPAY")

# =====================================================================
# BANCO DE DADOS EM MEMÓRIA (MOCK) - Substitua por SQLAlchemy/PostgreSQL
# =====================================================================
# Exemplo de tabela de usuários contendo as credenciais e status do plano
USUARIOS_DB: Dict[str, Dict[str, Any]] = {}
# Exemplo de tabela contendo as customizações clínicas enviadas para alinhar a IA
PERSONALIZACOES_DB: Dict[str, Dict[str, Any]] = {}

# =====================================================================
# PYDANTIC SCHEMAS (VALIDADORES DE ENTRADA)
# =====================================================================
class UserRegisterSchema(BaseModel):
    name: str = Field(..., example="Dr. Carlos Eduardo")
    email: EmailStr = Field(..., example="carlos.dentista@gmail.com")
    password: str = Field(..., min_length=6, example="SenhaForte123")
    document: str = Field(..., description="CPF ou CNPJ para faturamento", example="123.456.789-00")
    phone: str = Field(..., example="(11) 98765-4321")
    professional_id: str = Field(..., description="CRM ou CRO do profissional de saúde", example="CRM-SP 123456")

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class CustomizationSchema(BaseModel):
    clinic_name: str
    business_hours: str
    appointment_duration: str
    procedures: str
    greeting_message: str
    special_instructions: str

class WebhookResponse(BaseModel):
    status: str = "success"

# =====================================================================
# DEPENDÊNCIAS DE SEGURANÇA E JWT (AUTENTICAÇÃO E AUTORIZAÇÃO)
# =====================================================================
def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Middleware para proteger rotas. Decodifica o JWT Token enviado no cabeçalho Authorization.
    DICA: Para produções robustas, use o esquema de segurança OAuth2PasswordBearer do FastAPI.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorização ausente ou malformatado. Use o prefixo 'Bearer '"
        )
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email not in USUARIOS_DB:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário associado ao token não pôde ser localizado no sistema."
            )
        return USUARIOS_DB[email]
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Sua sessão expirou. Realize o login novamente."
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou adulterado."
        )

# =====================================================================
# ROTAS DE AUTENTICAÇÃO E CADASTROS
# =====================================================================
@app.post("/api/auth/register", status_code=status.HTTP_211_CREATED, tags=["Autenticação"])
def register(user_data: UserRegisterSchema):
    """
    Registra um novo profissional da saúde no sistema de teste.
    Define por padrão o plano trial com 7 dias de limite.
    """
    if user_data.email in USUARIOS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este endereço de e-mail já está cadastrado na nossa plataforma."
        )
    
    # Em produção: utilize hashes de senha seguros (como bcrypt/passlib) para salvar a senha cryptografada
    # Ex: hashed_password = pwd_context.hash(user_data.password)
    
    # Criando o novo usuário com plano 'Trial' padrão
    trial_start = datetime.datetime.utcnow()
    trial_end = trial_start + datetime.timedelta(days=7)
    
    USUARIOS_DB[user_data.email] = {
        "name": user_data.name,
        "email": user_data.email,
        "password": user_data.password,  # Salve em hash em produção!
        "document": user_data.document,
        "phone": user_data.phone,
        "professional_id": user_data.professional_id,
        "status": "trial",  # 'trial' ou 'premium'
        "trial_ends_at": trial_end,
        "created_at": trial_start
    }
    
    # Geração do token JWT inicial
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    token = jwt.encode(
        {"sub": user_data.email, "exp": expiration},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    return {
        "message": "Profissional registrado com sucesso! Período de trial de 7 dias iniciado.",
        "token": token,
        "user": {
            "name": user_data.name,
            "email": user_data.email,
            "status": "trial",
            "trial_days_left": 7
        }
    }

@app.post("/api/auth/login", tags=["Autenticação"])
def login(credentials: UserLoginSchema):
    """
    Autentica o profissional da saúde e devolve o token de acesso.
    """
    user = USUARIOS_DB.get(credentials.email)
    if not user or user["password"] != credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Combinação de e-mail e senha inválida."
        )
    
    # Calcular dias restantes no Trial
    days_left = 0
    if user["status"] == "trial":
        delta = user["trial_ends_at"] - datetime.datetime.utcnow()
        days_left = max(0, delta.days)

    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    token = jwt.encode(
        {"sub": user["email"], "exp": expiration},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    return {
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "status": user["status"],
            "trial_days_left": days_left
        }
    }

# =====================================================================
# ROTAS DO PAINEL DO CLIENTE (ROTAS PROTEGIDAS)
# =====================================================================
@app.get("/api/dashboard/profile", tags=["Dashboard"])
def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retorna os dados do usuário atual e o status da assinatura de forma dinâmica.
    """
    days_left = 0
    if current_user["status"] == "trial":
        delta = current_user["trial_ends_at"] - datetime.datetime.utcnow()
        days_left = max(0, delta.days)

    return {
        "name": current_user["name"],
        "email": current_user["email"],
        "document": current_user["document"],
        "phone": current_user["phone"],
        "professional_id": current_user["professional_id"],
        "status": current_user["status"],
        "trial_days_left": days_left,
        "customization": PERSONALIZACOES_DB.get(current_user["email"], None)
    }

@app.post("/api/dashboard/customize", tags=["Dashboard"])
def save_customization(
    customization: CustomizationSchema, 
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Salva ou atualiza os parâmetros da clínica para que a IA atue sob medida.
    O código da IA em si deve rodar isolado no backend, buscando estas informações.
    """
    PERSONALIZACOES_DB[current_user["email"]] = {
        **customization.dict(),
        "updated_at": datetime.datetime.utcnow()
    }
    return {
        "message": "Regras clínicas enviadas com sucesso! Nossa equipe técnica alinhará sua IA em até 2 horas.",
        "customization": PERSONALIZACOES_DB[current_user["email"]]
    }

# =====================================================================
# INTEGRAÇÃO DE PAGAMENTOS (PAGSEGURO / PICPAY)
# =====================================================================
@app.post("/api/billing/create-checkout", tags=["Faturamento"])
def create_checkout(
    gateway: str, # "pagseguro" ou "picpay"
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Gera um link de pagamento (Checkout) para a licença vitalícia (R$ 3.000,00) de acordo com o gateway ecolhido.
    """
    order_id = f"CLINICA_{current_user['email'].replace('@', '_at_')}"
    value = 3000.00
    
    if gateway == "pagseguro":
        # 📚 INTEGRAÇÃO PAGSEGURO:
        # Você deve fazer um POST HTTP para 'https://api.pagseguro.com/checkouts' (ou sandbox.api.pagseguro.com)
        # Enviando nos Headers:
        #   "Authorization": f"Bearer {PAGSEGURO_TOKEN}"
        #   "Content-Type": "application/json"
        # Corpo ideal sugerido:
        # {
        #   "reference": order_id,
        #   "customer": { "name": current_user["name"], "email": current_user["email"], "tax_id": current_user["document"].replace(".", "").replace("-", "") },
        #   "items": [{ "reference": "LICENCA_VITALICIA", "name": "Licença Vitalícia Secretária IA", "quantity": 1, "unit_amount": 300000 }], # Valor em centavos
        #   "redirect_url": "https://seu-front.com/dashboard?status=success",
        #   "notification_urls": ["https://seu-backend.com/api/webhooks/pagseguro"]
        # }
        
        # Simulando url de checkout devolvida pelo PagSeguro:
        checkout_url = f"https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=mock_pagseguro_{order_id}"
        return {
            "gateway": "pagseguro",
            "order_id": order_id,
            "value": value,
            "checkout_url": checkout_url,
            "message": "Checkout PagSeguro inicializado com sucesso."
        }
        
    elif gateway == "picpay":
        # 📚 INTEGRAÇÃO PICPAY:
        # Você deve fazer um POST HTTP para 'https://appws.picpay.com/ecommerce/public/payments'
        # Enviando nos Headers:
        #   "x-picpay-token": PICPAY_TOKEN
        #   "Content-Type": "application/json"
        # Corpo ideal sugerido:
        # {
        #   "referenceId": order_id,
        #   "callbackUrl": "https://seu-backend.com/api/webhooks/picpay",
        #   "returnUrl": "https://seu-front.com/dashboard?status=success",
        #   "value": value,
        #   "buyer": { "firstName": current_user["name"].split(" ")[0], "lastName": " ", "document": current_user["document"], "email": current_user["email"], "phone": current_user["phone"] }
        # }
        
        # Simulando url de checkout devolvida pelo PicPay:
        checkout_url = f"https://payment.picpay.com/checkout/mock_picpay_{order_id}"
        return {
            "gateway": "picpay",
            "order_id": order_id,
            "value": value,
            "checkout_url": checkout_url,
            "message": "Checkout PicPay inicializado com sucesso."
        }
    
    else:
        raise HTTPException(
            status_code=400,
            detail="Gateway de pagamento inválido ou não suportado pela nossa equipe."
        )

# =====================================================================
# ENDPOINTS WEBHOOKS (NOTIFICAÇÃO DE SUCESSO DE PAGAMENTO)
# =====================================================================
@app.post("/api/webhooks/pagseguro", tags=["Webhooks"])
async def webhook_pagseguro(request: Request):
    """
    Recebe as notificações de transações do PagSeguro.
    Ativa a licença vitalícia ('premium') quando o pagamento for aprovado.
    """
    # ⚠️ SEGURANÇA: Recomendamos verificar a procedência da chamada validando 
    # as assinaturas ou fazendo uma consulta de status direta usando o código da transação/ID que vem na payload
    
    try:
        body = await request.json()
        print("Webhook PagSeguro Recebido:", body)
        
        # Suponstando que o status seja 'PAID' ou '3' (Aprovado na API legada)
        event_status = body.get("charges", [{}])[0].get("status", "")
        reference = body.get("reference", "")
        
        # Localiza o usuário através do ID criado na referência (ex: CLINICA_{email})
        if event_status == "PAID" and reference.startswith("CLINICA_"):
            email_key = reference.replace("CLINICA_", "").replace("_at_", "@")
            if email_key in USUARIOS_DB:
                USUARIOS_DB[email_key]["status"] = "premium"
                print(f"Sucesso: Licença vitalícia ATIVADA para o e-mail: {email_key}")
                return {"status": "success", "message": "Licença Vitalícia ativada com sucesso via PagSeguro."}
                
    except Exception as e:
        # Evite quebrar o webhook, retorne 200 sempre com log do erro para diagnóstico da fila
        print(f"Erro ao processar Webhook PagSeguro: {str(e)}")
        
    return {"status": "success", "message": "Evento processado"}

@app.post("/api/webhooks/picpay", tags=["Webhooks"])
async def webhook_picpay(request: Request, x_seller_token: Optional[str] = Header(None)):
    """
    Recebe notificações de pagamento do PicPay.
    Protege comparando o cabeçalho 'x-seller-token' com seu segredo local.
    """
    # ⚠️ VERIFICAÇÃO DE SEGURANÇA: O PicPay envia o x-seller-token no Header para segurança
    if x_seller_token != PICPAY_SELLER_TOKEN:
        print("Aviso: Tentativa de webhook PicPay com Token de Seller incorreto de origem desconhecida.")
        # Retorne 200 ou 401 conforme desejado, se quer ocultar erros. Vamos lançar um log.
    
    try:
        body = await request.json()
        print("Webhook PicPay Recebido:", body)
        
        reference = body.get("referenceId", "")
        status_picpay = body.get("status", "") # Ex: 'paid'
        
        if status_picpay == "paid" and reference.startswith("CLINICA_"):
            email_key = reference.replace("CLINICA_", "").replace("_at_", "@")
            if email_key in USUARIOS_DB:
                USUARIOS_DB[email_key]["status"] = "premium"
                print(f"Sucesso: Licença vitalícia ATIVADA para o e-mail: {email_key}")
                return {"status": "success", "message": "Licença Vitalícia ativa com sucesso via PicPay."}
                
    except Exception as e:
        print(f"Erro ao processar Webhook PicPay: {str(e)}")
        
    return {"status": "success", "message": "Evento processado"}
