import React from "react";

const Results = ({ measurements }) => {
  if (!measurements) return <p>Belum ada pengukuran. Silakan mulai kamera!</p>;

  return (
    <div className="results" style={{
      margin: '20px',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        Hasil Pengukuran Tubuh (cm)
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
        {/* Pengukuran Badan Atas */}
        <div>
          <h4 style={{ margin: '10px 0', color: '#444' }}>Badan Atas</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '8px 0' }}>
              <strong>Lingkar Dada:</strong> {measurements.chest || 'N/A'}
            </li>
            <li style={{ margin: '8px 0' }}>
              <strong>Lebar Dada:</strong> {measurements.chestWidth || 'N/A'}
            </li>
            <li style={{ margin: '8px 0' }}>
              <strong>Lebar Bahu:</strong> {measurements.shoulderWidth || 'N/A'}
            </li>
            <li style={{ margin: '8px 0' }}>
              <strong>Lebar Pundak:</strong> {measurements.shoulderBreadth || 'N/A'}
            </li>
            <li style={{ margin: '8px 0' }}>
              <strong>Lingkar Leher:</strong> {measurements.neck || 'N/A'}
            </li>
            <li style={{ margin: '8px 0' }}>
              <strong>Lingkar Lengan Atas:</strong> {measurements.bicep || 'N/A'}
            </li>
          </ul>
        </div>

        {/* Pengukuran Badan Bawah */}
        <div>
          <h4 style={{ margin: '10px 0', color: '#444' }}>Badan Bawah</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ margin: '8px 0' }}>
              <strong>Lingkar Pinggang:</strong> {measurements.waist || 'N/A'}
            </li>
            <li style={{ margin: '8px 0' }}>
              <strong>Lingkar Pinggul:</strong> {measurements.hips || 'N/A'}
            </li>
            <li style={{ margin: '8px 0' }}>
              <strong>Panjang Punggung:</strong> {measurements.backLength || 'N/A'}
            </li>
            <li style={{ margin: '8px 0' }}>
              <strong>Panjang Lengan:</strong> {measurements.armLength || 'N/A'}
            </li>
          </ul>
        </div>
      </div>

      <h3 style={{ 
        marginTop: '20px', 
        color: '#333', 
        borderTop: '1px solid #eee', 
        paddingTop: '10px' 
      }}>
        Rekomendasi Ukuran Pakaian
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        <div>
          <h4 style={{ margin: '10px 0', color: '#444' }}>Atasan</h4>
          <p style={{ margin: '5px 0' }}>
            <strong>Kemeja:</strong> {
              measurements.chest > 100 ? 'XL' : 
              measurements.chest > 90 ? 'L' : 
              measurements.chest > 80 ? 'M' : 'S'
            }
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Jaket:</strong> {
              measurements.shoulderWidth > 45 ? 'L' : 'M'
            }
          </p>
        </div>
        
        <div>
          <h4 style={{ margin: '10px 0', color: '#444' }}>Bawahan</h4>
          <p style={{ margin: '5px 0' }}>
            <strong>Celana:</strong> {
              measurements.waist > 90 ? 'XL' : 
              measurements.waist > 80 ? 'L' : 
              measurements.waist > 70 ? 'M' : 'S'
            }
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Jeans:</strong> {
              measurements.hips > 100 ? 'W32+' : 
              measurements.hips > 90 ? 'W30-32' : 'W28-30'
            }
          </p>
        </div>
        
        <div>
          <h4 style={{ margin: '10px 0', color: '#444' }}>Lainnya</h4>
          <p style={{ margin: '5px 0' }}>
            <strong>Kemeja Formal:</strong> {
              measurements.neck > 40 ? 'XL' : 
              measurements.neck > 38 ? 'L' : 
              measurements.neck > 36 ? 'M' : 'S'
            }
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Setelan Jas:</strong> {
              measurements.chest > 100 ? '44+' : 
              measurements.chest > 95 ? '40-42' : '38-40'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results;