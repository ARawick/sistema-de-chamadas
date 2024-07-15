import { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiPlusCircle } from 'react-icons/fi';
import { AuthContext } from '../../contexts/auth';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import './new.css';
import { toast } from 'react-toastify';
import { list } from 'firebase/storage';

const listRef = collection(db, 'customers');

export default function New() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [selected, setSelected] = useState(0);
  const [complemento, setComplemento] = useState('');
  const [assunto, setAssunto] = useState('');
  const [status, setStatus] = useState('');
  const [idCustomer, setIdCustomer] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      const querySnapshot = await getDocs(listRef)
        .then((snapshot) => {
          let lista = [];
          snapshot.forEach((doc) => {
            lista.push({
              id: doc.id,
              nomeFantasia: doc.data().nomeFantasia,
            });
          });
          if (snapshot.docs.size === 0) {
            console.log('Nenhuma Empresa Encontrada');
            setCustomers([{ id: '1', nomeFantasia: 'FREELA' }]);
            setLoadCustomer(false);
            return;
          }
          setCustomers(lista);
          setLoadCustomer(false);

          if (id) {
            loadId(lista);
          }
        })
        .catch((error) => {
          console.log('Erro ao buscar clientes', error);
          setLoadCustomer(false);
          setCustomers([{ id: '1', nomeFantasia: 'FREELA' }]);
        });
    }
    loadCustomers();
  }, [id]);
  async function loadId(lista) {
    const docRef = doc(db, 'chamados', id);
    await getDoc(docRef)
      .then((snapshot) => {
        setAssunto(snapshot.data().assunto);
        setStatus(snapshot.data().status);
        setComplemento(snapshot.data().complemento);

        let index = lista.findIndex((item) => item.id === snapshot.data().clienteId);
        setSelected(index);
        setIdCustomer(true);
      })
      .catch((error) => {
        console.log(error);
        setIdCustomer(false);
      });
  }

  async function handleOptionChange(e) {
    setStatus(e.target.value);
  }

  async function handleChangeSelect(e) {
    setAssunto(e.target.value);
  }
  async function handleChangeCustomer(e) {
    setSelected(e.target.value);
  }
  async function handleRegister(e) {
    e.preventDefault();

    if (idCustomer) {
      //atualizando chamado
      const docRef = doc(db, 'chamados', id);
      await updateDoc(docRef, {
        cliente: customers[selected].nomeFantasia,
        clienteId: customers[selected].id,
        assunto: assunto,
        complemento: complemento,
        status: status,
        userId: user.uid,
      })
        .then(() => {
          toast.info('Chamado atualizado com sucesso!');
          setSelected(0);
          setComplemento('');
          navigate('/dashboard');
        })
        .catch((error) => {
          toast.error('Erro ao atualizar chamado!');
          console.log(error);
        });
      return;
    }

    //registrar chamado
    await addDoc(collection(db, 'chamados'), {
      created: new Date(),
      cliente: customers[selected].nomeFantasia,
      clienteId: customers[selected].id,
      assunto: assunto,
      complemento: complemento,
      status: status,
      userId: user.uid,
    })
      .then(() => {
        toast.success('Chamado registrado!');
        setComplemento('');
        setSelected(0);
      })
      .catch((error) => {
        toast.error('Erro ao registrar, tente novamente mais tarde');
        console.log(error);
      });
  }
  return (
    <div>
      <Header />
      <div className="content">
        <Title name={id ? 'Editando chamado' : 'Novo chamado'}>
          <FiPlusCircle size={25} />
        </Title>
        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Clientes</label>
            {loadCustomer ? (
              <input type="text" disabled={true} value="Carregando..." />
            ) : (
              <select value={selected} onChange={handleChangeCustomer}>
                {customers.map((item, index) => {
                  return (
                    <option key={index} value={index}>
                      {item.nomeFantasia}
                    </option>
                  );
                })}
              </select>
            )}

            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
              <option value="Suporte">Suporte</option>
              <option value="Visita">Visita Técnica</option>
              <option value="Financeiro">Financeiro</option>
            </select>

            <label>Status</label>
            <div className="status">
              <input
                type="radio"
                name="radio"
                value="Aberto"
                onChange={handleOptionChange}
                checked={status === 'Aberto'}
              />{' '}
              <span>Em aberto</span>
              <input
                type="radio"
                name="radio"
                value="Progresso"
                onChange={handleOptionChange}
                checked={status === 'Progresso'}
              />{' '}
              <span>Progresso</span>
              <input
                type="radio"
                name="radio"
                value="Atendido"
                onChange={handleOptionChange}
                checked={status === 'Atendido'}
              />{' '}
              <span>Atendido</span>
            </div>
            <label>Complemento</label>
            <textarea
              typ="text"
              placeholder="Descreve seu problema(opcional)"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
