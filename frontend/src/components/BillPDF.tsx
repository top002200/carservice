
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// สร้างสไตล์สำหรับ PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
    padding: 10,
    borderBottom: "1px solid #EEE",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    width: "30%",
  },
  value: {
    width: "70%",
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #EEE",
    padding: 5,
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#F0F0F0",
  },
  tableCol: {
    width: "50%",
  },
});

const BillPDF = ({ data }: { data: any }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ใบเสร็จรับเงิน</Text>
          <Text>เลขที่บิล: {data.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>ข้อมูลลูกค้า</Text>
          <View style={styles.row}>
            <Text style={styles.label}>ชื่อลูกค้า:</Text>
            <Text style={styles.value}>{data.username}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>เบอร์โทร:</Text>
            <Text style={styles.value}>{data.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>วันที่ออกบิล:</Text>
            <Text style={styles.value}>
              {new Date(data.created_at).toLocaleDateString("th-TH")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>รายการบริการ</Text>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol}>รายการ</Text>
            <Text style={styles.tableCol}>จำนวนเงิน (บาท)</Text>
          </View>
          {[1, 2, 3, 4].map(
            (i) =>
              data[`name${i}`] && (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{data[`name${i}`]}</Text>
                  <Text style={styles.tableCol}>
                    {data[`amount${i}`]?.toLocaleString()}
                  </Text>
                </View>
              )
          )}
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>สรุป</Text>
          <View style={styles.row}>
            <Text style={styles.label}>วิธีการชำระเงิน:</Text>
            <Text style={styles.value}>
              {data.payment_method === "cash" && "เงินสด"}
              {data.payment_method === "transfer" && "โอนเงิน"}
              {data.payment_method === "credit_card" && "บัตรเครดิต"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>หมายเหตุ:</Text>
            <Text style={styles.value}>{data.description || "-"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BillPDF;