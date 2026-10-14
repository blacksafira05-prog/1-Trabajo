
const DB = {
    pets: 'petvida_pets_v2', appointments: 'petvida_appointments_v2',
    care: 'petvida_care_v2', meds: 'petvida_meds_v2', cart: 'petvida_cart_v2'
};
const read = (key) => { try { return JSON.parse(localStorage.getItem(DB[key]) || '[]') } catch (e) { return [] } };
const write = (key, value) => localStorage.setItem(DB[key], JSON.stringify(value));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const petName = (id) => read('pets').find(p => p.id === id)?.name || 'Animal removido';
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function fillPetSelect(selectId) {
    const sel = document.getElementById(selectId); if (!sel) return;
    const pets = read('pets');
    sel.innerHTML = '<option value="">' + (pets.length ? 'Selecione o animal' : 'Cadastre um pet primeiro') + '</option>' + pets.map(p => `<option value="${esc(p.id)}">${esc(p.name)} — ${esc(p.species)}</option>`).join('');
    sel.disabled = !pets.length;
}
function empty(message) { return `<div class="empty">${message}</div>` }
function removeItem(key, itemId) { write(key, read(key).filter(x => x.id !== itemId)); renderPage() }
function renderHome() {
    const pets = read('pets'), apps = read('appointments'), care = read('care'), cart = read('cart');
    const el = (id) => document.getElementById(id);
    if (el('stat-pets')) el('stat-pets').textContent = pets.length;
    if (el('stat-appointments')) el('stat-appointments').textContent = apps.length;
    if (el('stat-care')) el('stat-care').textContent = care.length;
    if (el('stat-cart')) el('stat-cart').textContent = cart.reduce((s, x) => s + x.qty, 0);
    const homePets = el('home-pets');
    if (homePets) {
        homePets.innerHTML = pets.length ? pets.map(p => `<article class="card home-pet-card"><div class="home-pet-photo">${p.photo ? `<img src="${p.photo}" alt="Foto de ${esc(p.name)}">` : p.species === 'Gato' ? '🐱' : p.species === 'Cachorro' ? '🐶' : '🐾'}</div><div class="home-pet-info"><h3>${esc(p.name)}</h3><p>${esc(p.species)} · ${esc(p.gender)}${p.age ? ' · ' + esc(p.age) : ''}</p>${p.notes ? `<p class="home-pet-notes">${esc(p.notes)}</p>` : ''}<a class="tag" href="animais.html">Ver perfil →</a></div></article>`).join('') : empty('Você ainda não cadastrou nenhum animal. <a href="animais.html">Cadastre seu primeiro pet</a> para ver a foto dele aqui! 🐾');
    }
}
function renderPets() {
    const target = document.getElementById('pet-list'); if (!target) return;
    const query = (document.getElementById('pet-search')?.value || '').trim().toLowerCase();
    const pets = read('pets').filter(p => p.name.toLowerCase().includes(query));
    const count = document.getElementById('pet-count'); if (count) count.textContent = `${read('pets').length} animal(is) cadastrado(s).`;
    target.innerHTML = pets.length ? pets.map(p => `<article class="card pet-gallery-card"><div class="pet-gallery-photo">${p.photo ? `<img src="${p.photo}" alt="Foto de ${esc(p.name)}">` : `<span>${p.species === 'Gato' ? '🐱' : p.species === 'Cachorro' ? '🐶' : '🐾'}</span>`}</div><div class="pet-gallery-details"><span class="tag">${esc(p.species)}</span><h3>${esc(p.name)}</h3><p><strong>Gênero:</strong> ${esc(p.gender)}${p.age ? `<br><strong>Idade:</strong> ${esc(p.age)}` : ''}</p><div class="pet-gallery-notes"><strong>Descrição do animal</strong><p>${p.notes ? esc(p.notes) : 'Nenhuma descrição adicionada.'}</p></div><button class="danger small" data-action="delete-pet" data-id="${esc(p.id)}">Remover animal</button></div></article>`).join('') : empty(query ? 'Nenhum animal encontrado com esse nome.' : 'Nenhum animal cadastrado ainda. Cadastre um pet acima para ver a foto dele aqui! 🐾');
}
function renderAppointments() {
    const target = document.getElementById('appointment-list'); if (!target) return;
    const apps = read('appointments').slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    target.innerHTML = apps.length ? apps.map(a => `<article class="list-item"><div class="list-main"><div class="service-icon">📅</div><div><h3>${esc(petName(a.petId))} · ${esc(a.type)}</h3><p>${esc(a.date)} às ${esc(a.time)}${a.notes ? ' · ' + esc(a.notes) : ''}</p><span class="tag" style="margin-top:7px">Solicitação registrada</span></div></div><button class="danger small" data-action="delete-appointment" data-id="${esc(a.id)}">Cancelar</button></article>`).join('') : empty('Nenhuma consulta registrada. Preencha o formulário para solicitar um horário.');
}
function renderCare() {
    const target = document.getElementById('care-list'); if (!target) return;
    const arr = read('care').slice().reverse();
    target.innerHTML = arr.length ? arr.map(x => `<article class="list-item"><div class="list-main"><div class="service-icon">🧼</div><div><h3>${esc(petName(x.petId))} · ${esc(x.type)}</h3><p>Data desejada: ${esc(x.date)}${x.notes ? ' · ' + esc(x.notes) : ''}</p></div></div><button class="danger small" data-action="delete-care" data-id="${esc(x.id)}">Remover</button></article>`).join('') : empty('Nenhum cuidado registrado. Você pode adicionar banho, tosa, corte de unhas e outros serviços.');
}
function renderMeds() {
    const target = document.getElementById('med-list'); if (!target) return;
    const arr = read('meds').slice().reverse();
    target.innerHTML = arr.length ? arr.map(x => `<article class="list-item"><div class="list-main"><div class="service-icon">💊</div><div><h3>${esc(petName(x.petId))} · ${esc(x.name)}</h3><p>${x.dose ? 'Dose: ' + esc(x.dose) + ' · ' : ''}${x.frequency ? 'Frequência: ' + esc(x.frequency) + ' · ' : ''}${x.start ? 'Início: ' + esc(x.start) + ' · ' : ''}${x.end ? 'Término: ' + esc(x.end) : ''}${x.notes ? '<br>' + esc(x.notes) : ''}</p></div></div><button class="danger small" data-action="delete-med" data-id="${esc(x.id)}">Remover</button></article>`).join('') : empty('Nenhuma orientação salva. Registre somente informações fornecidas pelo veterinário.');
}
const products = [
    { id: 'toy', name: 'Brinquedo mordedor', icon: '🦴', price: 24.90, desc: 'Para momentos de brincadeira e enriquecimento.' },
    { id: 'bowl', name: 'Pote para água e ração', icon: '🥣', price: 39.90, desc: 'Um item prático para a rotina alimentar.' },
    { id: 'leash', name: 'Guia para passeio', icon: '🦮', price: 49.90, desc: 'Acessório para passeios com segurança.' },
    { id: 'brush', name: 'Escova de pelos', icon: '🪮', price: 34.90, desc: 'Ajuda a manter a pelagem bem cuidada.' },
    { id: 'bed', name: 'Caminha confortável', icon: '🛏️', price: 89.90, desc: 'Um cantinho macio para descansar.' },
    { id: 'ball', name: 'Bola para brincar', icon: '🎾', price: 19.90, desc: 'Diversão supervisionada para seu pet.' }
];
function renderShop() {
    const target = document.getElementById('product-list'); if (!target) return;
    target.innerHTML = products.map(p => `<article class="card product-card"><div class="product-art">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p><div class="buy-row"><span class="price">${money(p.price)}</span><button data-action="add-cart" data-id="${p.id}">＋ Adicionar</button></div></article>`).join('');
    const cart = read('cart'), cartEl = document.getElementById('cart-list');
    cartEl.innerHTML = cart.length ? cart.map(c => { const p = products.find(p => p.id === c.productId); if (!p) return ''; return `<div class="list-item"><div><h3>${p.icon} ${p.name}</h3><p>${c.qty} × ${money(p.price)}</p></div><div class="list-actions"><button class="secondary small" data-action="minus-cart" data-id="${p.id}" aria-label="Diminuir">−</button><button class="small" data-action="add-cart" data-id="${p.id}" aria-label="Aumentar">+</button></div></div>` }).join('') : empty('Seu carrinho está vazio.');
    document.getElementById('cart-total').textContent = money(cart.reduce((s, c) => s + (products.find(p => p.id === c.productId)?.price || 0) * c.qty, 0));
}
function renderPage() {
    renderHome(); renderPets(); renderAppointments(); renderCare(); renderMeds(); renderShop();
    ['appointment-pet', 'care-pet', 'med-pet'].forEach(fillPetSelect);
}
function setMinDate(id) { const el = document.getElementById(id); if (el) { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); el.min = d.toISOString().slice(0, 10) } }
document.addEventListener('submit', async e => {
    const form = e.target; if (!form.id) return;
    if (form.id === 'pet-form') {
        e.preventDefault(); const fd = new FormData(form); const file = fd.get('photo'); let photo = '';
        if (file && file.size) { if (file.size > 1_500_000) { alert('Escolha uma foto de até 1,5 MB para não ocupar muito espaço.'); return } photo = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file) }) }
        const pet = { id: id(), name: fd.get('name').trim(), species: fd.get('species'), gender: fd.get('gender'), age: fd.get('age').trim(), notes: fd.get('notes').trim(), photo }; const pets = read('pets'); pets.push(pet); write('pets', pets); form.reset(); renderPage();
        const subject = encodeURIComponent(`Cadastro de animal - ${pet.name}`);
        const body = encodeURIComponent(`Olá! Seguem os dados do animal cadastrado no PetVida:\n\nNome: ${pet.name}\nEspécie: ${pet.species}\nGênero: ${pet.gender}\nIdade: ${pet.age || 'Não informada'}\nObservações: ${pet.notes || 'Nenhuma'}\n\nObservação: a foto do animal não é anexada automaticamente.\n`);
        const sendEmail = confirm('Pet cadastrado com sucesso! Deseja abrir seu aplicativo de e-mail para enviar os dados para Blacksafira05@gmail.com?');
        if (sendEmail) window.location.href = `mailto:Blacksafira05@gmail.com?subject=${subject}&body=${body}`;
    }
    if (form.id === 'appointment-form') {
        e.preventDefault(); const petId = document.getElementById('appointment-pet').value; if (!petId) { alert('Cadastre e selecione um pet primeiro.'); return }
        const date = document.getElementById('appointment-date').value, time = document.getElementById('appointment-time').value;
        if (!date || date < new Date().toLocaleDateString('en-CA')) { alert('Escolha uma data de hoje em diante.'); return }
        const arr = read('appointments'); arr.push({ id: id(), petId, type: document.getElementById('appointment-type').value, date, time, notes: document.getElementById('appointment-notes').value.trim() }); write('appointments', arr); form.reset(); renderPage(); alert('Solicitação registrada neste navegador. A clínica ainda precisa confirmar o horário.');
    }
    if (form.id === 'care-form') {
        e.preventDefault(); const petId = document.getElementById('care-pet').value; if (!petId) { alert('Cadastre e selecione um pet primeiro.'); return }
        const date = document.getElementById('care-date').value; if (!date) { alert('Escolha uma data desejada.'); return }
        const arr = read('care'); arr.push({ id: id(), petId, type: document.getElementById('care-type').value, date, notes: document.getElementById('care-notes').value.trim() }); write('care', arr); form.reset(); renderPage(); alert('Cuidado registrado!');
    }
    if (form.id === 'med-form') {
        e.preventDefault(); const petId = document.getElementById('med-pet').value; if (!petId) { alert('Cadastre e selecione um pet primeiro.'); return }
        const arr = read('meds'); arr.push({ id: id(), petId, name: document.getElementById('med-name').value.trim(), dose: document.getElementById('med-dose').value.trim(), frequency: document.getElementById('med-frequency').value.trim(), start: document.getElementById('med-start').value, end: document.getElementById('med-end').value, notes: document.getElementById('med-notes').value.trim() }); write('meds', arr); form.reset(); renderPage(); alert('Orientação registrada. Siga sempre a prescrição veterinária.');
    }
});
document.addEventListener('click', e => {
    const b = e.target.closest('[data-action]'); if (!b) return;
    const action = b.dataset.action, itemId = b.dataset.id;
    if (action === 'delete-pet') {
        if (!confirm('Remover este pet? Os registros anteriores relacionados podem continuar no histórico.')) return;
        write('pets', read('pets').filter(p => p.id !== itemId)); renderPage();
    }
    if (action === 'delete-appointment' && confirm('Cancelar esta solicitação?')) removeItem('appointments', itemId);
    if (action === 'delete-care' && confirm('Remover este registro de cuidado?')) removeItem('care', itemId);
    if (action === 'delete-med' && confirm('Remover esta orientação salva?')) removeItem('meds', itemId);
    if (action === 'add-cart' || action === 'minus-cart') {
        const cart = read('cart'), item = cart.find(x => x.productId === itemId);
        if (action === 'add-cart') { if (item) item.qty++; else cart.push({ productId: itemId, qty: 1 }) }
        else if (item) { item.qty--; if (item.qty <= 0) cart.splice(cart.indexOf(item), 1) }
        write('cart', cart); renderShop(); renderHome();
    }
});
document.getElementById('pet-search')?.addEventListener('input', renderPets);
document.getElementById('checkout-btn')?.addEventListener('click', () => { const cart = read('cart'); if (!cart.length) { alert('Adicione algum produto ao carrinho primeiro.'); return } alert('Esta é uma loja demonstrativa. Nenhum pagamento foi realizado.'); });
document.getElementById('appointment-date') && setMinDate('appointment-date');
document.getElementById('care-date') && setMinDate('care-date');
renderPage();
