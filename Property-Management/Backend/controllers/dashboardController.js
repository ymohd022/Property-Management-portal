const db = require("../config/database")
const ExcelJS = require("exceljs")

exports.getDashboardData = async (req, res) => {
  try {
    // Get KPI data
    const [propertiesResult] = await db.query(`
      SELECT COUNT(*) as totalSites FROM properties
    `)

    const [flatsResult] = await db.query(`
      SELECT 
        COUNT(*) as totalFlats,
        SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END) as soldFlats,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as availableFlats
      FROM flats
    `)

    const [salesResult] = await db.query(`
      SELECT SUM(sale_amount) as totalRevenue
      FROM sales
      WHERE status = 'Completed'
    `)

    const [pendingPaymentsResult] = await db.query(`
      SELECT SUM(sale_amount) as pendingPayments
      FROM sales
      WHERE status = 'Pending'
    `)

    // Get monthly revenue data
    const [revenueData] = await db.query(`
      SELECT 
        MONTH(sale_date) as month,
        SUM(sale_amount) as revenue
      FROM sales
      WHERE 
        YEAR(sale_date) = YEAR(CURRENT_DATE())
        AND status = 'Completed'
      GROUP BY MONTH(sale_date)
      ORDER BY month
    `)

    // Format revenue data for chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const revenueByMonth = Array(12).fill(0)

    revenueData.forEach((item) => {
      revenueByMonth[item.month - 1] = Number(item.revenue)
    })

    // Get property occupancy data
    const [occupancyData] = await db.query(`
      SELECT 
        p.name,
        COUNT(f.id) as totalFlats,
        SUM(CASE WHEN f.status = 'Sold' THEN 1 ELSE 0 END) as soldFlats,
        SUM(CASE WHEN f.status = 'Available' THEN 1 ELSE 0 END) as availableFlats
      FROM properties p
      LEFT JOIN flats f ON p.id = f.property_id
      GROUP BY p.id
      ORDER BY totalFlats DESC
      LIMIT 6
    `)

    // Get agent performance data
    const [agentPerformanceData] = await db.query(`
      SELECT 
        a.name,
        COUNT(s.id) as salesCount
      FROM agents a
      LEFT JOIN sales s ON a.id = s.agent_id AND s.status = 'Completed'
      GROUP BY a.id
      ORDER BY salesCount DESC
      LIMIT 5
    `)

    // Get recent transactions
    const [recentTransactions] = await db.query(`
      SELECT 
        s.id,
        c.name as client,
        CONCAT('Flat ', f.flat_number, ', ', p.name) as property,
        s.sale_amount as amount,
        s.sale_date as date,
        s.status
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      JOIN properties p ON s.property_id = p.id
      JOIN flats f ON s.flat_id = f.id
      ORDER BY s.sale_date DESC
      LIMIT 5
    `)

    // Format data for response
    const dashboardData = {
      kpis: {
        totalSites: propertiesResult[0].totalSites,
        totalFlats: flatsResult[0].totalFlats || 0,
        soldFlats: flatsResult[0].soldFlats || 0,
        availableFlats: flatsResult[0].availableFlats || 0,
        totalRevenue: salesResult[0]?.totalRevenue || 0,
        pendingPayments: pendingPaymentsResult[0]?.pendingPayments || 0,
      },
      revenueData: {
        labels: months,
        datasets: [
          {
            label: "Revenue",
            data: revenueByMonth,
          },
        ],
      },
      occupancyData: {
        labels: occupancyData.map((item) => item.name),
        datasets: [
          {
            label: "Sold",
            data: occupancyData.map((item) => item.soldFlats || 0),
          },
          {
            label: "Available",
            data: occupancyData.map((item) => item.availableFlats || 0),
          },
        ],
      },
      agentPerformanceData: {
        labels: agentPerformanceData.map((item) => item.name),
        datasets: [
          {
            label: "Sales (in units)",
            data: agentPerformanceData.map((item) => item.salesCount || 0),
          },
        ],
      },
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        client: tx.client,
        property: tx.property,
        amount: tx.amount,
        date: tx.date,
        status: tx.status,
      })),
    }

    res.json(dashboardData)
  } catch (error) {
    console.error("Error getting dashboard data:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

exports.exportDashboardReport = async (req, res) => {
  try {
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "QMAKS Property Management"
    workbook.created = new Date()

    // Add a worksheet for KPIs
    const kpiSheet = workbook.addWorksheet("KPIs")

    // Get KPI data
    const [propertiesResult] = await db.query(`
      SELECT COUNT(*) as totalSites FROM properties
    `)

    const [flatsResult] = await db.query(`
      SELECT 
        COUNT(*) as totalFlats,
        SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END) as soldFlats,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as availableFlats
      FROM flats
    `)

    const [salesResult] = await db.query(`
      SELECT SUM(sale_amount) as totalRevenue
      FROM sales
      WHERE status = 'Completed'
    `)

    const [pendingPaymentsResult] = await db.query(`
      SELECT SUM(sale_amount) as pendingPayments
      FROM sales
      WHERE status = 'Pending'
    `)

    // Add KPI data to worksheet
    kpiSheet.columns = [
      { header: "Metric", key: "metric", width: 20 },
      { header: "Value", key: "value", width: 20 },
    ]

    kpiSheet.addRows([
      { metric: "Total Sites", value: propertiesResult[0].totalSites },
      { metric: "Total Flats", value: flatsResult[0].totalFlats || 0 },
      { metric: "Sold Flats", value: flatsResult[0].soldFlats || 0 },
      { metric: "Available Flats", value: flatsResult[0].availableFlats || 0 },
      { metric: "Total Revenue", value: salesResult[0]?.totalRevenue || 0 },
      { metric: "Pending Payments", value: pendingPaymentsResult[0]?.pendingPayments || 0 },
    ])

    // Add a worksheet for monthly revenue
    const revenueSheet = workbook.addWorksheet("Monthly Revenue")

    // Get monthly revenue data
    const [revenueData] = await db.query(`
      SELECT 
        MONTH(sale_date) as month,
        MONTHNAME(sale_date) as month_name,
        SUM(sale_amount) as revenue
      FROM sales
      WHERE 
        YEAR(sale_date) = YEAR(CURRENT_DATE())
        AND status = 'Completed'
      GROUP BY MONTH(sale_date)
      ORDER BY month
    `)

    // Add revenue data to worksheet
    revenueSheet.columns = [
      { header: "Month", key: "month", width: 15 },
      { header: "Revenue", key: "revenue", width: 15 },
    ]

    revenueData.forEach((item) => {
      revenueSheet.addRow({ month: item.month_name, revenue: item.revenue })
    })

    // Add a worksheet for property occupancy
    const occupancySheet = workbook.addWorksheet("Property Occupancy")

    // Get property occupancy data
    const [occupancyData] = await db.query(`
      SELECT 
        p.name,
        COUNT(f.id) as totalFlats,
        SUM(CASE WHEN f.status = 'Sold' THEN 1 ELSE 0 END) as soldFlats,
        SUM(CASE WHEN f.status = 'Available' THEN 1 ELSE 0 END) as availableFlats
      FROM properties p
      LEFT JOIN flats f ON p.id = f.property_id
      GROUP BY p.id
      ORDER BY totalFlats DESC
    `)

    // Add occupancy data to worksheet
    occupancySheet.columns = [
      { header: "Property", key: "property", width: 30 },
      { header: "Total Flats", key: "totalFlats", width: 15 },
      { header: "Sold Flats", key: "soldFlats", width: 15 },
      { header: "Available Flats", key: "availableFlats", width: 15 },
      { header: "Sold %", key: "soldPercentage", width: 15 },
    ]

    occupancyData.forEach((item) => {
      const soldPercentage = item.totalFlats > 0 ? ((item.soldFlats / item.totalFlats) * 100).toFixed(2) + "%" : "0%"
      occupancySheet.addRow({
        property: item.name,
        totalFlats: item.totalFlats || 0,
        soldFlats: item.soldFlats || 0,
        availableFlats: item.availableFlats || 0,
        soldPercentage: soldPercentage,
      })
    })

    // Add a worksheet for agent performance
    const agentSheet = workbook.addWorksheet("Agent Performance")

    // Get agent performance data
    const [agentData] = await db.query(`
      SELECT 
        a.name,
        COUNT(s.id) as salesCount,
        SUM(s.sale_amount) as salesAmount,
        SUM(c.commission_amount) as commissionAmount
      FROM agents a
      LEFT JOIN sales s ON a.id = s.agent_id AND s.status = 'Completed'
      LEFT JOIN commissions c ON c.sale_id = s.id AND c.agent_id = a.id
      GROUP BY a.id
      ORDER BY salesAmount DESC
    `)

    // Add agent data to worksheet
    agentSheet.columns = [
      { header: "Agent", key: "agent", width: 20 },
      { header: "Sales Count", key: "salesCount", width: 15 },
      { header: "Sales Amount", key: "salesAmount", width: 20 },
      { header: "Commission Amount", key: "commissionAmount", width: 20 },
    ]

    agentData.forEach((item) => {
      agentSheet.addRow({
        agent: item.name,
        salesCount: item.salesCount || 0,
        salesAmount: item.salesAmount || 0,
        commissionAmount: item.commissionAmount || 0,
      })
    })

    // Add a worksheet for recent transactions
    const transactionsSheet = workbook.addWorksheet("Recent Transactions")

    // Get recent transactions
    const [transactions] = await db.query(`
      SELECT 
        s.id,
        c.name as client,
        CONCAT('Flat ', f.flat_number, ', ', p.name) as property,
        s.sale_amount as amount,
        s.sale_date as date,
        s.status,
        a.name as agent
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      JOIN properties p ON s.property_id = p.id
      JOIN flats f ON s.flat_id = f.id
      LEFT JOIN agents a ON s.agent_id = a.id
      ORDER BY s.sale_date DESC
      LIMIT 100
    `)

    // Add transactions data to worksheet
    transactionsSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Client", key: "client", width: 20 },
      { header: "Property", key: "property", width: 30 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Date", key: "date", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Agent", key: "agent", width: 20 },
    ]

    transactions.forEach((tx) => {
      transactionsSheet.addRow({
        id: tx.id,
        client: tx.client,
        property: tx.property,
        amount: tx.amount,
        date: tx.date,
        status: tx.status,
        agent: tx.agent || "N/A",
      })
    })

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", "attachment; filename=dashboard-report.xlsx")

    // Write to response
    await workbook.xlsx.write(res)

    // End response
    res.end()
  } catch (error) {
    console.error("Error exporting dashboard report:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
