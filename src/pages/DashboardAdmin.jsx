import NavBar from '../components/NavBar';
import KafkaAdminPanel from '../components/KafkaAdminPanel';
import RabbitAdminPanel from '../components/RabbitAdminPanel';

function DashboardAdmin() {
    return (
        <>
            <NavBar />
            <main className="admin-main">
                <h1>Panel de administración</h1>
                <RabbitAdminPanel />
            </main>
        </>
    );
}

export default DashboardAdmin;