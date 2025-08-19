import CreateToken from '@/components/CreateToken';
import IPFSTest from '@/components/IPFSTest';

export default function CreateCoin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-trash-green via-green-900 to-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-trash-yellow mb-4">🗑️ Create Your $GOR Meme Coin</h1>
                                <p className="text-xl text-green-200">Let&apos;s make some trashy tokens together!</p>
        </div>
        <CreateToken />
        
        {/* IPFS Test Component */}
        <div className="mt-8">
          <IPFSTest />
        </div>
      </div>
    </div>
  );
}