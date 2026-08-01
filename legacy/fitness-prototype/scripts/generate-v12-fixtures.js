const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dataDir = path.join(root, 'assets', 'data');
const docsDataDir = path.join(root, 'docs', 'data');
const docsProductDir = path.join(root, 'docs', 'product');
const docsQaDir = path.join(root, 'docs', 'qa');

for (const dir of [dataDir, docsDataDir, docsProductDir, docsQaDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const writeJson = (name, value) => {
  fs.writeFileSync(path.join(dataDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const writeMd = (name, body) => {
  fs.writeFileSync(path.join(root, name), `${body.trim()}\n`, 'utf8');
};

const pad = value => String(value).padStart(2, '0');
const moneyPlan = id => plans.find(plan => plan.id === id).amount;

const users = {
  'admin@personalops.test': {
    id: 'usr-admin-01',
    name: 'Admin PersonalOps',
    email: 'admin@personalops.test',
    password: 'admin123',
    role: 'admin',
    roleLabel: 'Administrativo',
    avatar: 'A',
    admin: true
  },
  'professor@personalops.test': {
    id: 'usr-prof-01',
    name: 'Prof. Silva',
    email: 'professor@personalops.test',
    password: 'prof123',
    role: 'professor',
    roleLabel: 'Professor',
    avatar: 'S',
    professionalId: 'prof-01'
  },
  'aluno@personalops.test': {
    id: 'usr-student-01',
    name: 'Carlos Mendes',
    email: 'aluno@personalops.test',
    password: 'aluno123',
    role: 'aluno',
    roleLabel: 'Aluno',
    avatar: 'C',
    studentId: 'std-01'
  }
};

const professionals = [
  {
    id: 'prof-01',
    name: 'Prof. Silva',
    displayName: 'Prof. Silva',
    specialty: 'Hipertrofia e reabilitacao leve',
    methodSummary: 'Progressao de carga com tecnica controlada, check-ins semanais e ajustes por aderencia.',
    communicationTone: 'Direto, tecnico e humano',
    activeStudentsCount: 8,
    weeklyCheckinDay: 'sexta-feira',
    defaultWorkoutSplit: 'ABC com ajustes por disponibilidade',
    aiRules: [
      'Nunca publicar treino sem revisao do professor.',
      'Evitar impacto alto quando houver restricao articular leve.',
      'Priorizar clareza de carga, descanso e tecnica.'
    ],
    financialProfile: {
      documentType: 'cpf',
      documentMasked: '***.***.123-**',
      pixKeyType: 'email',
      pixKeyMasked: 'prof***@email.com',
      bankName: 'Banco Exemplo',
      accountHolderName: 'Professor Demo Silva',
      defaultBillingFrequency: 'monthly',
      defaultReminderDays: [7, 3, 1, 0, -1, -3, -7],
      paymentProvider: 'pix-manual-mock',
      futureProviders: ['future-asaas', 'future-mercadopago', 'future-pagarme', 'future-open-finance']
    }
  },
  {
    id: 'prof-02',
    name: 'Camila Rocha',
    displayName: 'Profa. Camila',
    specialty: 'Emagrecimento, condicionamento e consultoria online',
    methodSummary: 'Rotinas sustentaveis com treinos curtos, monitoramento de fadiga e adaptacao para casa ou condominio.',
    communicationTone: 'Acolhedor, objetivo e educativo',
    activeStudentsCount: 8,
    weeklyCheckinDay: 'segunda-feira',
    defaultWorkoutSplit: 'Full body e circuitos metabolicos',
    aiRules: [
      'Sugerir alternativas sem maquinas quando necessario.',
      'Nunca inferir dado de saude sensivel.',
      'Encaminhar dor persistente para avaliacao profissional presencial.'
    ],
    financialProfile: {
      documentType: 'cnpj',
      documentMasked: '**.***.456/0001-**',
      pixKeyType: 'random',
      pixKeyMasked: 'pix-demo-****-****-7890',
      bankName: 'Banco Exemplo Empresas',
      accountHolderName: 'Camila Rocha Treinamento Demo',
      defaultBillingFrequency: 'monthly',
      defaultReminderDays: [7, 3, 1, 0, -1, -3, -7],
      paymentProvider: 'pix-manual-mock',
      futureProviders: ['future-asaas', 'future-mercadopago', 'future-pagarme', 'future-open-finance']
    }
  }
];

const plans = [
  ['plan-01', 'prof-01', 'Consultoria mensal', 'Treino mensal com check-in semanal', 'monthly', 249.9, ['Treino mensal', 'Check-in semanal', 'Ajuste por feedback']],
  ['plan-02', 'prof-01', 'Presencial 2x semana', 'Acompanhamento presencial duas vezes por semana', 'monthly', 780, ['8 sessoes presenciais', 'Planilha no app', 'Feedback de execucao']],
  ['plan-03', 'prof-01', 'Presencial 3x semana', 'Rotina presencial para hipertrofia e tecnica', 'monthly', 1050, ['12 sessoes presenciais', 'Ajustes semanais', 'Controle de carga']],
  ['plan-04', 'prof-02', 'Online premium', 'Consultoria online com acompanhamento proximo', 'monthly', 349.9, ['Treino semanal', 'Check-in por app', 'Adaptacao para casa/academia']],
  ['plan-05', 'prof-02', 'Trimestral com acompanhamento', 'Pacote trimestral com revisao mensal', 'quarterly', 899.7, ['3 meses', 'Revisao mensal', 'Relatorio de aderencia']],
  ['plan-06', 'prof-01', 'Avulso avaliacao + treino', 'Avaliacao inicial e prescricao unica', 'single', 199.9, ['Avaliacao inicial mockada', 'Treino unico', 'Sem recorrencia']]
].map(([id, professionalId, name, description, frequency, amount, includes]) => ({
  id,
  professionalId,
  name,
  description,
  frequency,
  amount,
  currency: 'BRL',
  includes,
  isActive: true
}));

const studentSeed = [
  ['Carlos Mendes', 'prof-01', 'Hipertrofia muscular', 'hibrido', 'intermediario', 'Alta', 'low', 'plan-01', 'monthly', '2026-06-18', 'active', ['Leve desconforto no ombro esquerdo'], 'Treino recem-ajustado para melhorar estabilidade no supino.'],
  ['Ana Rodrigues', 'prof-01', 'Emagrecimento', 'online', 'intermediario', 'Alta', 'low', 'plan-01', 'monthly', '2026-06-12', 'due_soon', [], 'Feedback pendente sobre intensidade de membros inferiores.'],
  ['Pedro Lima', 'prof-01', 'Forca maxima', 'presencial', 'avancado', 'Baixa', 'medium', 'plan-03', 'monthly', '2026-06-06', 'overdue', [], 'Baixa adesao por agenda de trabalho.'],
  ['Mariana Costa', 'prof-01', 'Condicionamento fisico', 'hibrido', 'iniciante', 'Alta', 'low', 'plan-02', 'monthly', '2026-06-25', 'active', [], 'Evolucao positiva na adaptacao inicial.'],
  ['Luiza Santos', 'prof-02', 'Emagrecimento', 'online', 'iniciante', 'Alta', 'low', 'plan-04', 'monthly', '2026-07-01', 'paused', ['Evitar agachamento profundo'], 'Aluno online com limitacao leve no joelho.'],
  ['Julio Cesar', 'prof-01', 'Hipertrofia', 'presencial', 'avancado', 'Alta', 'low', 'plan-03', 'quarterly', '2026-07-10', 'active', [], 'Evolucao positiva em cargas multiarticulares.'],
  ['Gabriela Dias', 'prof-02', 'Definicao muscular', 'hibrido', 'intermediario', 'Alta', 'low', 'plan-04', 'monthly', '2026-06-13', 'due_soon', [], 'Aluno hibrido com boa resposta a treinos metabolicos.'],
  ['Roberto Alves', 'prof-02', 'Saude cardiovascular', 'online', 'intermediario', 'Media', 'medium', 'plan-04', 'monthly', '2026-06-28', 'active', ['Monitorar intensidade cardiovascular'], 'Duvida recorrente sobre zonas de esforco.'],
  ['Felipe Andrade', 'prof-02', 'Condicionamento fisico', 'presencial', 'iniciante', 'Alta', 'low', 'plan-02', 'biweekly', '2026-06-20', 'active', [], 'Presencial iniciante com boa frequencia.'],
  ['Lucas Sousa', 'prof-01', 'Hipertrofia', 'hibrido', 'intermediario', 'Baixa', 'high', 'plan-01', 'monthly', '2026-06-04', 'overdue', [], 'Inadimplente e sem treinar ha mais de 10 dias.'],
  ['Patricia Lima', 'prof-02', 'Emagrecimento', 'online', 'avancado', 'Alta', 'low', 'plan-05', 'quarterly', '2026-08-01', 'active', [], 'Feedback pendente sobre volume alto.'],
  ['Ricardo Santos', 'prof-01', 'Condicionamento fisico', 'presencial', 'intermediario', 'Media', 'medium', 'plan-02', 'monthly', '2026-06-11', 'due_soon', ['Evitar flexao lombar sob fadiga'], 'Limitar flexao de coluna e monitorar tecnica.'],
  ['Fernanda Melo', 'prof-02', 'Massa muscular', 'hibrido', 'iniciante', 'Alta', 'low', 'plan-04', 'semiannual', '2026-09-10', 'active', [], 'Evolucao positiva em casa com poucos equipamentos.'],
  ['Thiago Rocha', 'prof-01', 'Hipertrofia', 'online', 'avancado', 'Alta', 'low', 'plan-01', 'annual', '2027-01-10', 'active', [], 'Treino recem-ajustado para rotina online.'],
  ['Camila Nogueira', 'prof-02', 'Emagrecimento', 'hibrido', 'intermediario', 'Alta', 'low', 'plan-05', 'weekly', '2026-06-17', 'active', [], 'Pagamento em dia e alta adesao.'],
  ['Bruno Fonseca', 'prof-02', 'Condicionamento fisico', 'online', 'iniciante', 'Baixa', 'medium', 'plan-06', 'single', '2026-06-10', 'canceled', [], 'Aluno pausado/cancelado para retorno futuro.']
];

const students = studentSeed.map((seed, index) => {
  const id = `std-${pad(index + 1)}`;
  const [
    name,
    professionalId,
    goal,
    trainingMode,
    level,
    adherenceStatus,
    riskLevel,
    planId,
    billingFrequency,
    nextDueDate,
    paymentStatus,
    restrictions,
    notes
  ] = seed;
  return {
    id,
    professionalId,
    name,
    goal,
    trainingMode,
    level,
    adherenceStatus,
    riskLevel,
    lastWorkoutAt: `2026-06-${pad(Math.max(1, 9 - (index % 8)))}T0${(index % 4) + 6}:00:00-03:00`,
    nextWorkoutAt: `2026-06-${pad(10 + (index % 5))}T0${(index % 4) + 7}:00:00-03:00`,
    restrictions,
    preferredGymContext: ['Academia comercial', 'Condominio', 'Home gym', 'Studio'][index % 4],
    usesBluetooth: index % 3 === 0,
    internetQuality: ['boa', 'excelente', 'instavel'][index % 3],
    notes,
    planId,
    subscriptionId: `sub-${pad(index + 1)}`,
    billingFrequency,
    nextDueDate,
    paymentStatus,
    reminderOptIn: index !== 15,
    preferredReminderChannel: ['whatsapp-mock', 'email-mock', 'in-app'][index % 3],
    weeklyScheduleId: `ws-${pad(index + 1)}`
  };
});

const subscriptions = students.map((student, index) => ({
  id: student.subscriptionId,
  studentId: student.id,
  professionalId: student.professionalId,
  planId: student.planId,
  frequency: student.billingFrequency,
  startDate: `2026-0${(index % 5) + 1}-01`,
  nextDueDate: student.nextDueDate,
  status: student.paymentStatus === 'canceled' ? 'canceled' : student.paymentStatus === 'paused' ? 'paused' : 'active',
  paymentMethodPreference: 'pix',
  reminderSchedule: [7, 3, 1, 0, -1, -3, -7],
  gatewayProvider: index % 11 === 0 ? 'future-asaas' : 'pix-manual-mock',
  gatewayCustomerIdMock: `cus_mock_${String(index + 1).padStart(4, '0')}`
}));

const invoiceStatuses = ['open', 'due_soon', 'overdue', 'open', 'scheduled', 'paid', 'due_soon', 'open', 'open', 'overdue', 'scheduled', 'due_soon', 'paid', 'open', 'open', 'canceled'];
const invoices = students.map((student, index) => ({
  id: `inv-${String(index + 1).padStart(4, '0')}`,
  subscriptionId: student.subscriptionId,
  studentId: student.id,
  professionalId: student.professionalId,
  dueDate: student.nextDueDate,
  amount: moneyPlan(student.planId),
  status: invoiceStatuses[index],
  paymentMethod: 'pix',
  paymentMethods: ['pix', 'manual', 'credit_card', 'debit_card', 'boleto'],
  pixQrCodeMock: `PIX-QR-DEMO-${String(index + 1).padStart(4, '0')}`,
  pixCopyPasteMock: `personalops-demo-pix-copy-paste-invoice-${String(index + 1).padStart(4, '0')}`,
  paymentLinkMock: `https://personalops.test/pay/mock/invoice-${String(index + 1).padStart(4, '0')}`,
  createdAt: `2026-06-01T0${index % 9}:00:00-03:00`,
  paidAt: invoiceStatuses[index] === 'paid' ? `2026-06-0${(index % 6) + 1}T12:00:00-03:00` : null,
  reminderStatus: invoiceStatuses[index] === 'paid' ? 'skipped' : invoiceStatuses[index] === 'overdue' ? 'after_due_active' : 'scheduled'
}));

const paymentEvents = invoices.flatMap((invoice, index) => {
  const base = [
    ['invoice_created', { source: 'fixture', gatewayProvider: 'pix-manual-mock' }],
    ['pix_qr_generated', { qrCodeMock: invoice.pixQrCodeMock }],
    ['reminder_scheduled', { offsets: [7, 3, 1, 0, -1, -3, -7] }]
  ];
  if (invoice.status === 'paid') base.push(['payment_confirmed', { confirmation: 'manual-mock' }]);
  if (invoice.status === 'overdue') base.push(['payment_overdue', { daysOverdue: index === 9 ? 6 : 4 }]);
  if (invoice.status === 'canceled') base.push(['invoice_canceled', { reason: 'subscription canceled mock' }]);
  return base.map(([type, payload], eventIndex) => ({
    id: `payevt-${pad(index + 1)}-${eventIndex + 1}`,
    invoiceId: invoice.id,
    studentId: invoice.studentId,
    professionalId: invoice.professionalId,
    type,
    createdAt: `2026-06-${pad(2 + eventIndex)}T10:${pad(index)}:00-03:00`,
    payload
  }));
});

const notificationRules = [
  [7, '7 dias antes', 'Olá, {{studentName}}. Sua mensalidade do plano {{planName}} vence em {{dueDate}}. Você pode realizar o pagamento via Pix pelo app.'],
  [3, '3 dias antes', 'Oi, {{studentName}}. Passando para lembrar que seu plano {{planName}} vence em {{dueDate}}. O Pix demonstrativo está no app.'],
  [1, '1 dia antes', 'Olá, {{studentName}}. Seu vencimento é amanhã. Veja o Pix demonstrativo do plano {{planName}} no PersonalOps.'],
  [0, 'No dia do vencimento', '{{studentName}}, sua mensalidade vence hoje. A cobrança Pix demonstrativa está disponível no app.'],
  [-1, '1 dia após vencimento', 'Olá, {{studentName}}. Identificamos vencimento pendente do plano {{planName}}. Regularize pelo Pix demonstrativo no app.'],
  [-3, '3 dias após vencimento', 'Oi, {{studentName}}. Sua cobrança segue pendente. Se já pagou, desconsidere este lembrete mockado.'],
  [-7, '7 dias após vencimento', '{{studentName}}, sua assinatura aparece vencida há 7 dias neste ambiente demonstrativo. Fale com seu professor para ajustar.']
].map(([offsetDays, name, template], index) => ({
  id: `rule-${pad(index + 1)}`,
  name,
  offsetDays,
  channel: ['whatsapp-mock', 'email-mock', 'in-app'][index % 3],
  template,
  active: true
}));

const notificationEvents = invoices.slice(0, 14).flatMap((invoice, index) => [0, 1].map((_, subIndex) => {
  const rule = notificationRules[(index + subIndex) % notificationRules.length];
  const student = students.find(item => item.id === invoice.studentId);
  const plan = plans.find(item => item.id === student.planId);
  return {
    id: `notevt-${pad(index + 1)}-${subIndex + 1}`,
    studentId: invoice.studentId,
    invoiceId: invoice.id,
    ruleId: rule.id,
    channel: rule.channel,
    status: invoice.status === 'paid' ? 'skipped' : subIndex === 0 ? 'sent' : 'scheduled',
    scheduledFor: `2026-06-${pad(8 + index + subIndex)}T09:00:00-03:00`,
    sentAt: subIndex === 0 && invoice.status !== 'paid' ? `2026-06-${pad(8 + index)}T09:05:00-03:00` : null,
    messagePreview: rule.template
      .replace('{{studentName}}', student.name.split(' ')[0])
      .replace('{{planName}}', plan.name)
      .replace('{{dueDate}}', invoice.dueDate)
  };
}));

const exerciseDefs = [
  ['Supino Reto com Barra', 'peito', ['triceps', 'ombros'], 'Barra e banco', 'intermediario', 'empurrar'],
  ['Supino Inclinado com Halteres', 'peito', ['triceps', 'ombros'], 'Halteres e banco inclinado', 'intermediario', 'empurrar'],
  ['Crucifixo Inclinado com Halteres', 'peito', ['ombros'], 'Halteres e banco', 'intermediario', 'empurrar'],
  ['Crossover na Polia', 'peito', ['ombros'], 'Polia', 'intermediario', 'empurrar'],
  ['Flexao de Braco', 'peito', ['triceps', 'core'], 'Peso corporal', 'iniciante', 'empurrar'],
  ['Puxada Alta Frente', 'costas', ['biceps'], 'Polia alta', 'iniciante', 'puxar'],
  ['Remada Curvada com Barra', 'costas', ['biceps', 'core'], 'Barra', 'avancado', 'puxar'],
  ['Remada Baixa', 'costas', ['biceps'], 'Cabo', 'iniciante', 'puxar'],
  ['Pulldown Neutro', 'costas', ['biceps'], 'Polia', 'intermediario', 'puxar'],
  ['Barra Fixa Assistida', 'costas', ['biceps', 'core'], 'Maquina assistida', 'intermediario', 'puxar'],
  ['Rosca Direta com Barra', 'biceps', ['antebraco'], 'Barra W', 'iniciante', 'flexao de cotovelo'],
  ['Rosca Alternada com Halteres', 'biceps', ['antebraco'], 'Halteres', 'iniciante', 'flexao de cotovelo'],
  ['Rosca Martelo', 'biceps', ['antebraco'], 'Halteres', 'iniciante', 'flexao de cotovelo'],
  ['Rosca Scott', 'biceps', ['antebraco'], 'Banco Scott', 'intermediario', 'flexao de cotovelo'],
  ['Rosca Concentrada', 'biceps', ['antebraco'], 'Halter', 'intermediario', 'flexao de cotovelo'],
  ['Triceps Corda', 'triceps', ['ombros'], 'Polia', 'iniciante', 'extensao de cotovelo'],
  ['Triceps Testa', 'triceps', ['ombros'], 'Barra W', 'intermediario', 'extensao de cotovelo'],
  ['Paralelas Assistidas', 'triceps', ['peito', 'ombros'], 'Maquina assistida', 'intermediario', 'empurrar'],
  ['Triceps Frances Halter', 'triceps', ['core'], 'Halter', 'intermediario', 'extensao de cotovelo'],
  ['Supino Fechado', 'triceps', ['peito'], 'Barra e banco', 'avancado', 'empurrar'],
  ['Desenvolvimento com Halteres', 'ombros', ['triceps'], 'Halteres', 'intermediario', 'empurrar vertical'],
  ['Elevacao Lateral', 'ombros', ['trapezio'], 'Halteres', 'iniciante', 'abducao de ombro'],
  ['Elevacao Frontal', 'ombros', ['peito'], 'Halteres', 'iniciante', 'flexao de ombro'],
  ['Face Pull', 'ombros', ['costas'], 'Cabo', 'iniciante', 'puxar'],
  ['Crucifixo Inverso', 'ombros', ['costas'], 'Halteres', 'intermediario', 'abducao horizontal'],
  ['Agachamento Livre', 'pernas', ['gluteos', 'core'], 'Barra e rack', 'avancado', 'agachar'],
  ['Leg Press 45', 'pernas', ['gluteos'], 'Leg press', 'iniciante', 'agachar'],
  ['Cadeira Extensora', 'pernas', [], 'Maquina extensora', 'iniciante', 'extensao de joelho'],
  ['Mesa Flexora', 'pernas', ['panturrilhas'], 'Mesa flexora', 'iniciante', 'flexao de joelho'],
  ['Passada com Halteres', 'pernas', ['gluteos', 'core'], 'Halteres', 'intermediario', 'estocada'],
  ['Hip Thrust', 'gluteos', ['pernas', 'core'], 'Banco e barra', 'intermediario', 'ponte de quadril'],
  ['Cadeira Abdutora', 'gluteos', ['quadril'], 'Maquina abdutora', 'iniciante', 'abducao de quadril'],
  ['Stiff com Halteres', 'gluteos', ['pernas', 'costas'], 'Halteres', 'intermediario', 'dobradica de quadril'],
  ['Gluteo no Cabo', 'gluteos', ['core'], 'Cabo', 'iniciante', 'extensao de quadril'],
  ['Agachamento Sumo', 'gluteos', ['pernas'], 'Halter', 'intermediario', 'agachar'],
  ['Prancha Frontal', 'core', ['ombros'], 'Colchonete', 'iniciante', 'anti-extensao'],
  ['Crunch no Solo', 'core', [], 'Colchonete', 'iniciante', 'flexao de tronco'],
  ['Dead Bug', 'core', ['quadril'], 'Colchonete', 'iniciante', 'anti-extensao'],
  ['Pallof Press', 'core', ['ombros'], 'Cabo ou elastico', 'intermediario', 'anti-rotacao'],
  ['Elevacao de Pernas', 'core', ['quadril'], 'Banco ou solo', 'intermediario', 'flexao de quadril'],
  ['Caminhada em Esteira', 'cardio leve', ['pernas'], 'Esteira', 'iniciante', 'cardio continuo'],
  ['Bicicleta Ergometica Leve', 'cardio leve', ['pernas'], 'Bicicleta', 'iniciante', 'cardio continuo'],
  ['Eliptico Leve', 'cardio leve', ['pernas', 'ombros'], 'Eliptico', 'iniciante', 'cardio continuo'],
  ['Remo Ergometro Leve', 'cardio leve', ['costas', 'pernas'], 'Remo', 'intermediario', 'cardio tecnico'],
  ['Escada Leve', 'cardio leve', ['gluteos', 'pernas'], 'Simulador de escada', 'intermediario', 'cardio continuo'],
  ['Mobilidade Toracica', 'mobilidade', ['costas'], 'Colchonete', 'iniciante', 'mobilidade'],
  ['Alongamento Flexores do Quadril', 'mobilidade', ['gluteos'], 'Colchonete', 'iniciante', 'mobilidade'],
  ['Mobilidade de Tornozelo', 'mobilidade', ['pernas'], 'Parede', 'iniciante', 'mobilidade'],
  ['Rotacao Externa com Elastico', 'mobilidade', ['ombros'], 'Elastico', 'iniciante', 'pre-ativacao'],
  ['Agachamento Goblet Tecnico', 'mobilidade', ['pernas', 'gluteos'], 'Kettlebell ou halter', 'iniciante', 'padrao tecnico']
];

const exercises = exerciseDefs.map(([name, primaryMuscle, secondaryMuscles, equipment, difficulty, movementPattern], index) => ({
  id: `ex-${pad(index + 1)}`,
  name,
  category: primaryMuscle,
  primaryMuscle,
  secondaryMuscles,
  equipment,
  difficulty,
  movementPattern,
  defaultRestSeconds: ['cardio leve', 'mobilidade'].includes(primaryMuscle) ? 30 : difficulty === 'avancado' ? 120 : 75,
  defaultTempo: primaryMuscle === 'cardio leve' ? 'continuo' : primaryMuscle === 'mobilidade' ? 'controlado' : '3-0-1-0',
  coachingCues: ['Controle a fase de descida.', 'Mantenha postura estavel.', 'Pare se houver dor aguda.'],
  commonMistakes: ['Usar carga acima da tecnica.', 'Perder amplitude controlada.', 'Prender a respiracao sem necessidade.'],
  safetyNotes: 'Exercicio demonstrativo. Ajustes reais exigem avaliacao de profissional habilitado.',
  substitutionIds: [`ex-${pad(((index + 1) % exerciseDefs.length) + 1)}`, `ex-${pad(((index + 2) % exerciseDefs.length) + 1)}`],
  visualType: index % 10 === 2 ? 'licensed-gif-placeholder' : index % 13 === 0 ? 'future-3d-placeholder' : 'css-mannequin',
  visualStatus: index % 10 === 2 ? 'needs-license' : index % 13 === 0 ? 'future-owned-asset' : 'placeholder'
}));

const libraryNames = [
  'Peito + Biceps',
  'Costas + Triceps',
  'Pernas + Core',
  'Ombros + Abdomen',
  'Superior completo',
  'Inferior completo',
  'Full body iniciante',
  'Full body intermediario',
  'Hipertrofia 4x semana',
  'Hipertrofia 5x semana',
  'Emagrecimento circuito',
  'Treino rapido 30 minutos',
  'Retorno com baixa carga',
  'Treino sem maquinas',
  'Treino em condominio',
  'Treino em casa'
];

const workoutExerciseSets = [
  ['ex-01', 'ex-02', 'ex-11', 'ex-13'],
  ['ex-06', 'ex-08', 'ex-16', 'ex-17'],
  ['ex-26', 'ex-27', 'ex-36', 'ex-38'],
  ['ex-21', 'ex-22', 'ex-37', 'ex-40'],
  ['ex-01', 'ex-06', 'ex-21', 'ex-16'],
  ['ex-26', 'ex-29', 'ex-31', 'ex-36'],
  ['ex-05', 'ex-27', 'ex-08', 'ex-41'],
  ['ex-01', 'ex-06', 'ex-26', 'ex-36'],
  ['ex-01', 'ex-06', 'ex-26', 'ex-21'],
  ['ex-01', 'ex-07', 'ex-26', 'ex-31', 'ex-21'],
  ['ex-41', 'ex-05', 'ex-30', 'ex-36'],
  ['ex-05', 'ex-12', 'ex-36', 'ex-42'],
  ['ex-50', 'ex-49', 'ex-41', 'ex-38'],
  ['ex-05', 'ex-30', 'ex-36', 'ex-47'],
  ['ex-27', 'ex-08', 'ex-42', 'ex-46'],
  ['ex-05', 'ex-35', 'ex-36', 'ex-47']
];

const workoutLibrary = libraryNames.map((name, index) => ({
  id: `lib-${pad(index + 1)}`,
  professionalId: index % 3 === 0 ? 'prof-02' : 'prof-01',
  name,
  category: index < 10 ? 'forca' : index < 12 ? 'condicionamento' : 'adaptacao',
  goal: index < 10 ? 'Hipertrofia e consistencia' : 'Aderencia e seguranca',
  level: index % 4 === 2 ? 'iniciante' : index % 4 === 3 ? 'avancado' : 'intermediario',
  estimatedDurationMinutes: index === 11 ? 30 : index > 12 ? 40 : 60,
  tags: ['mockado', 'biblioteca', 'clonavel'],
  exerciseBlocks: [{
    blockName: 'Bloco principal',
    exercises: workoutExerciseSets[index].map((exerciseId, exerciseIndex) => ({
      exerciseId,
      order: exerciseIndex + 1,
      sets: exerciseIndex === 0 ? 4 : 3,
      reps: exerciseIndex === 0 ? '8-10' : '10-12',
      restSeconds: exerciseIndex === 0 ? 90 : 60,
      loadSuggestion: exerciseIndex === 0 ? 'Carga moderada' : 'Tecnica antes da carga',
      notes: 'Prescricao demonstrativa para prototipo.'
    }))
  }],
  canClone: true,
  isSystemTemplate: true
}));

const workoutTemplates = workoutLibrary.slice(0, 8).map((workout, index) => ({
  ...workout,
  id: `tpl-${pad(index + 1)}`,
  sourceLibraryWorkoutId: workout.id,
  isSystemTemplate: false,
  templateScope: 'professional-reusable',
  notes: 'Template reutilizavel pelo professor; diferente da prescricao vinculada a aluno.'
}));

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const dayTitles = ['Descanso', 'Peito + Biceps', 'Cardio leve', 'Pernas + Core', 'Check-in', 'Costas + Triceps', 'Mobilidade'];

const weeklySchedules = students.map((student, index) => ({
  id: student.weeklyScheduleId,
  studentId: student.id,
  professionalId: student.professionalId,
  weekStartsOn: '2026-06-08',
  days: Object.fromEntries(dayKeys.map((day, dayIndex) => [
    day,
    {
      type: dayIndex === 0 ? 'rest' : dayIndex === 2 ? 'cardio' : dayIndex === 4 ? 'checkin' : dayIndex === 6 ? 'assessment' : 'workout',
      workoutId: ['monday', 'wednesday', 'friday'].includes(day) ? `pw-${pad(index + 1)}-${day}` : null,
      title: dayTitles[dayIndex],
      notes: dayIndex === 4 ? 'Responder check-in no app.' : 'Agenda demonstrativa.'
    }
  ]))
}));

const prescribedWorkouts = students.flatMap((student, index) => ['monday', 'wednesday', 'friday'].map((day, dayIndex) => {
  const libraryWorkout = workoutLibrary[(index + dayIndex) % workoutLibrary.length];
  return {
    id: `pw-${pad(index + 1)}-${day}`,
    sourceLibraryWorkoutId: libraryWorkout.id,
    clonedFromStudentId: dayIndex === 2 && index > 0 ? 'std-01' : null,
    studentId: student.id,
    professionalId: student.professionalId,
    title: libraryWorkout.name,
    scheduledDay: day,
    scheduledDate: day === 'wednesday' ? '2026-06-10' : day === 'monday' ? '2026-06-08' : '2026-06-12',
    status: day === 'wednesday' ? 'active' : day === 'monday' ? 'completed' : 'published',
    estimatedDurationMinutes: libraryWorkout.estimatedDurationMinutes,
    exercises: libraryWorkout.exerciseBlocks[0].exercises.map(exercise => ({
      exerciseId: exercise.exerciseId,
      order: exercise.order,
      sets: exercise.sets,
      reps: exercise.reps,
      loadSuggestion: exercise.loadSuggestion,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes
    }))
  };
}));

const workoutEventTypes = ['workout_started', 'set_completed', 'rest_started', 'rest_finished', 'load_changed', 'exercise_skipped', 'workout_finished', 'feedback_submitted', 'sync_pending', 'sync_completed'];
const workoutEvents = Array.from({ length: 36 }, (_, index) => {
  const student = students[index % students.length];
  const workout = prescribedWorkouts.find(item => item.studentId === student.id) || prescribedWorkouts[0];
  return {
    id: `wevt-${String(index + 1).padStart(3, '0')}`,
    studentId: student.id,
    workoutId: workout.id,
    type: workoutEventTypes[index % workoutEventTypes.length],
    createdAt: `2026-06-${pad(5 + (index % 6))}T${pad(7 + (index % 12))}:15:00-03:00`,
    payload: {
      exerciseId: workout.exercises[0].exerciseId,
      setIndex: (index % 4) + 1,
      load: 20 + index,
      note: 'Evento sintetico de treino.'
    },
    syncStatus: index % 9 === 0 ? 'sync_pending' : 'sync_completed'
  };
});

const feedbackMessages = [
  'Treino concluido com sucesso e carga controlada.',
  'Senti dor leve no ombro durante o supino.',
  'Equipamento indisponivel na academia hoje.',
  'Treino ficou longo demais para meu horario.',
  'Tive dificuldade de execucao no movimento.',
  'Baixa motivacao nesta semana.',
  'Quero trocar um exercicio por falta de maquina.',
  'Duvida sobre qual carga usar.',
  'Dificuldade com pausa de descanso.',
  'Consegui concluir tudo com boa tecnica.'
];

const feedbacks = Array.from({ length: 20 }, (_, index) => {
  const student = students[index % students.length];
  const workout = prescribedWorkouts.find(item => item.studentId === student.id) || prescribedWorkouts[0];
  return {
    id: `fb-${String(index + 1).padStart(3, '0')}`,
    studentId: student.id,
    workoutId: workout.id,
    exerciseId: index % 3 === 0 ? workout.exercises[0].exerciseId : null,
    sentiment: index % 5 === 1 ? 'dor leve' : index % 5 === 0 ? 'positivo' : 'neutro',
    intensity: (index % 10) + 1,
    message: feedbackMessages[index % feedbackMessages.length],
    requiresReview: [1, 2, 3, 4, 5, 6, 7, 8].includes(index % 10),
    createdAt: `2026-06-${pad(3 + (index % 7))}T${pad(8 + (index % 10))}:30:00-03:00`
  };
});

const assessments = students.slice(0, 12).map((student, index) => ({
  id: `asm-${String(index + 1).padStart(3, '0')}`,
  studentId: student.id,
  goal: student.goal,
  restrictions: student.restrictions,
  experienceLevel: student.level,
  weeklyAvailability: `${2 + (index % 4)} dias por semana`,
  weeklyFrequency: 2 + (index % 4),
  availability: `${2 + (index % 4)} dias por semana`,
  preferredWorkoutDuration: [30, 45, 60, 75][index % 4],
  notes: 'Anamnese sintetica para validacao. Nao representa historico medico real.',
  consentMock: true
}));

const voiceDrafts = [
  {
    id: 'vd-001',
    professionalId: 'prof-01',
    studentId: 'std-16',
    rawTranscript: 'Criar treino de segunda para Bruno. Peito e biceps. Supino inclinado, tres series de doze, descanso de noventa segundos. Supino reto, quatro de dez. Rosca direta, tres de doze.',
    parsedResult: {
      day: 'monday',
      workoutTitle: 'Peito e biceps',
      exercises: [
        { name: 'Supino inclinado', sets: 3, reps: '12', restSeconds: 90 },
        { name: 'Supino reto', sets: 4, reps: '10', restSeconds: 90 },
        { name: 'Rosca direta', sets: 3, reps: '12', restSeconds: 60 }
      ],
      notes: 'Revisar antes de publicar.'
    },
    confidence: 0.84,
    needsReview: true,
    createdAt: '2026-06-10T09:00:00-03:00'
  },
  {
    id: 'vd-002',
    professionalId: 'prof-01',
    studentId: 'std-01',
    rawTranscript: 'Ajustar quarta do Carlos para pernas e core com carga moderada.',
    parsedResult: {
      day: 'wednesday',
      workoutTitle: 'Pernas e core moderado',
      exercises: [
        { name: 'Leg press', sets: 4, reps: '10', restSeconds: 90 },
        { name: 'Prancha', sets: 3, reps: '40 segundos', restSeconds: 45 }
      ],
      notes: 'Checar restricao de ombro nao impacta.'
    },
    confidence: 0.78,
    needsReview: true,
    createdAt: '2026-06-10T10:20:00-03:00'
  },
  {
    id: 'vd-003',
    professionalId: 'prof-02',
    studentId: 'std-05',
    rawTranscript: 'Treino em casa para Luiza sem impacto no joelho.',
    parsedResult: {
      day: 'friday',
      workoutTitle: 'Casa sem impacto',
      exercises: [
        { name: 'Ponte de quadril', sets: 3, reps: '15', restSeconds: 60 },
        { name: 'Dead bug', sets: 3, reps: '10 cada lado', restSeconds: 45 }
      ],
      notes: 'Evitar flexao profunda de joelho.'
    },
    confidence: 0.81,
    needsReview: true,
    createdAt: '2026-06-09T15:10:00-03:00'
  }
];

writeJson('users.json', users);
writeJson('professionals.json', professionals);
writeJson('students.json', students);
writeJson('plans.json', plans);
writeJson('subscriptions.json', subscriptions);
writeJson('invoices.json', invoices);
writeJson('payment-events.json', paymentEvents);
writeJson('notification-rules.json', notificationRules);
writeJson('notification-events.json', notificationEvents);
writeJson('exercises.json', exercises);
writeJson('workout-library.json', workoutLibrary);
writeJson('workout-templates.json', workoutTemplates);
writeJson('weekly-schedules.json', weeklySchedules);
writeJson('prescribed-workouts.json', prescribedWorkouts);
writeJson('workout-events.json', workoutEvents);
writeJson('feedbacks.json', feedbacks);
writeJson('assessments.json', assessments);
writeJson('voice-drafts.json', voiceDrafts);

writeMd('docs/data/TEST_FIXTURES.md', `
# Test Fixtures — PersonalOps V1.2

Todos os arquivos em \`assets/data/\` usam dados sintéticos para validar operação, treino e cobrança Pix mockada. Não há CPF real, chave Pix real, conta bancária real, aluno real ou pagamento real.

## Entidades

- \`users.json\`: credenciais demo por perfil.
- \`professionals.json\`: professores sintéticos com perfil financeiro mascarado e provider \`pix-manual-mock\`.
- \`students.json\`: 16 alunos sintéticos com modo de treino, risco, plano, assinatura, vencimento e grade semanal.
- \`plans.json\`, \`subscriptions.json\`, \`invoices.json\`: planos, recorrências e cobranças demonstrativas.
- \`notification-rules.json\` e \`notification-events.json\`: régua automática simulada; não envia WhatsApp, e-mail ou push real.
- \`exercises.json\`: 50 exercícios com placeholders visuais sem imagens externas.
- \`workout-library.json\`: biblioteca de treinos prontos clonáveis.
- \`workout-templates.json\`: modelos reutilizáveis pelo professor.
- \`prescribed-workouts.json\`: treinos publicados para alunos específicos.
- \`workout-events.json\`, \`feedbacks.json\`, \`assessments.json\`, \`voice-drafts.json\`: execução, feedback, anamnese sintética e criação assistida por voz/texto.

## Relacionamentos

Aluno aponta para \`professionalId\`, \`planId\`, \`subscriptionId\` e \`weeklyScheduleId\`. Assinatura aponta para plano e aluno. Cobrança aponta para assinatura. Treino prescrito aponta para aluno e biblioteca. Eventos de treino e feedbacks apontam para aluno e treino.

## Biblioteca, Template e Prescrição

\`workout-library.json\` representa treinos prontos de sistema. \`workout-templates.json\` representa modelos reutilizáveis que o professor pode adaptar. \`prescribed-workouts.json\` representa o treino vinculado a um aluno em uma data/dia.

## Evolução futura

Para banco real, manter os mesmos IDs semânticos, migrar relações para tabelas e substituir \`pix-manual-mock\` por um \`PaymentProvider\` real somente fora do GitHub Pages e sem dados sensíveis no repositório.
`);

writeMd('docs/product/PIX_BILLING_REQUIREMENTS.md', `
# Pix Billing Requirements — PersonalOps V1.2

## Por que Pix entra primeiro

Pix manual mockado permite validar se professor e aluno entendem cobrança, vencimento, QR Code demonstrativo e copia e cola antes de integrar gateway real.

## Pix manual, QR estático e QR dinâmico

- Pix manual mockado: estado visual no app, sem transação.
- QR Code estático real: exigiria chave Pix real e risco operacional; fora da V1.
- QR Code dinâmico real: exigiria gateway, identificador de cobrança, callback e conciliação; fora da V1.

## Open Finance

Open Finance não entra na V1 porque exige consentimento, integração regulada e tratamento de dados financeiros reais. Esta versão não coleta nem processa dado real.

## Evolução para gateway

A arquitetura reserva \`gatewayProvider\` para \`future-asaas\`, \`future-mercadopago\`, \`future-pagarme\` e \`future-open-finance\`. A troca futura deve acontecer por uma camada \`PaymentProvider\`, com backend, logs de auditoria e webhook.

## LGPD e dados financeiros

Nenhum CPF, CNPJ, chave Pix, dado bancário ou aluno real deve ser publicado no GitHub Pages. Campos financeiros são mascarados e demonstrativos.
`);

writeMd('docs/product/ADMIN_BILLING_REQUIREMENTS.md', `
# Admin Billing Requirements — PersonalOps V1.2

A área administrativa deve permitir validar gestão de planos, periodicidade, assinaturas, cobranças, lembretes e status financeiros sem backend real.

## Telas esperadas

- Receita prevista.
- Cobranças Pix em aberto.
- Cobranças vencidas.
- Notificações agendadas.
- Alunos ativos e inadimplentes.
- Lista de cobranças recentes.
- Status das notificações.
- Visão de gateway mockado.

## Regras

Toda cobrança é demonstrativa. O app não deve gerar pagamento real, link real, QR Code real, WhatsApp real ou autenticação real.
`);

writeMd('docs/product/WORKOUT_LIBRARY_REQUIREMENTS.md', `
# Workout Library Requirements — PersonalOps V1.2

## Biblioteca de exercícios

A biblioteca contém 50 exercícios com grupo muscular, equipamento, dificuldade, dicas, erros comuns, notas de segurança e placeholders visuais. Nenhum asset externo é usado.

## Biblioteca de treinos

\`workout-library.json\` inclui treinos prontos como Peito + Bíceps, Full body, Emagrecimento circuito, treino em casa e treino em condomínio.

## Templates, prescrição e execução

Template é modelo reutilizável. Prescrição é treino vinculado a aluno e data. Execução é o evento registrado pelo aluno durante o treino.

## Clonagem

A ação \`cloneWorkoutMock(sourceWorkoutId, targetStudentId)\` cria uma cópia local e um evento local. Não persiste em backend.

## Voz/texto

O fluxo é ditar, interpretar, estruturar, revisar e publicar. O sistema nunca deve publicar automaticamente.
`);

writeMd('docs/qa/V1_2_TEST_PLAN.md', `
# V1.2 Test Plan

## Perfis

1. Abrir memorial público.
2. Entrar na aplicação.
3. Logar com Admin, Professor e Aluno usando credenciais demo.

## Admin

Verificar cards financeiros, cobranças Pix mockadas, notificações, alunos ativos, inadimplentes e aviso de pagamento demonstrativo.

## Professor

Verificar alunos com status financeiro, vencimentos próximos, inadimplentes, dados Pix mockados, biblioteca de treinos, clonar treino, grade semanal, feedbacks pendentes e rascunhos de voz/texto.

## Aluno

Verificar plano, periodicidade, próxima cobrança, status da mensalidade, QR Code Pix demonstrativo, Pix copia e cola, aviso de ambiente demonstrativo, treino da semana, treino do dia, timer, registro de série e fila offline.

## Cache e console

Rodar \`node --check assets/js/app.js\`, \`node --check assets/js/data-store.js\` e \`git diff --check\`. Em navegador, confirmar ausência de erro crítico do PersonalOps e ausência de overflow horizontal em viewport mobile.
`);

