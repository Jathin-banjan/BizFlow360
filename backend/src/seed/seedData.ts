import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

// Models
import { User } from '../modules/users/user.model.js';
import { Category } from '../modules/products/category.model.js';
import { Product } from '../modules/products/product.model.js';
import { Supplier } from '../modules/suppliers/supplier.model.js';
import { PurchaseOrder } from '../modules/purchase-orders/purchaseOrder.model.js';
import { CustomerOrder } from '../modules/orders/customerOrder.model.js';
import { InventoryMovement } from '../modules/inventory/inventoryMovement.model.js';
import { Requirement } from '../modules/requirements/requirement.model.js';
import { BusinessInsight } from '../modules/analytics/businessInsight.model.js';
import { AuditEvent } from '../modules/audit/auditEvent.model.js';

export async function seedDatabase(shouldConnect: boolean = true) {
  try {
    if (shouldConnect) {
      logger.info('Connecting to MongoDB for deterministic seed generation...');
      await mongoose.connect(config.mongoUri);
    }

    logger.info('Cleaning existing test collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      CustomerOrder.deleteMany({}),
      InventoryMovement.deleteMany({}),
      Requirement.deleteMany({}),
      BusinessInsight.deleteMany({}),
      AuditEvent.deleteMany({}),
    ]);

    // 1. Seed Users
    logger.info('Seeding demo users...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@12345', salt);
    const managerPass = await bcrypt.hash('Manager@12345', salt);
    const analystPass = await bcrypt.hash('Analyst@12345', salt);

    const [adminUser, managerUser, analystUser] = await User.create([
      {
        username: 'admin',
        email: 'admin@bizflow360.com',
        passwordHash: adminPass,
        role: 'ADMIN',
        fullName: 'Eleanor Vance',
        department: 'Operations & Strategy',
        isActive: true,
      },
      {
        username: 'manager',
        email: 'manager@bizflow360.com',
        passwordHash: managerPass,
        role: 'MANAGER',
        fullName: 'Marcus Sterling',
        department: 'Supply Chain & Fulfillment',
        isActive: true,
      },
      {
        username: 'analyst',
        email: 'analyst@bizflow360.com',
        passwordHash: analystPass,
        role: 'ANALYST',
        fullName: 'Sophia Chen',
        department: 'Business Intelligence & Functional Analytics',
        isActive: true,
      },
    ]);

    // 2. Seed Categories
    logger.info('Seeding product categories...');
    const categories = await Category.create([
      {
        code: 'COMP',
        name: 'Enterprise Computing',
        description: 'High-performance laptops, workstations, and thin clients',
        icon: 'Laptop',
      },
      {
        code: 'ELEC',
        name: 'Smart Devices & Audio',
        description: 'Professional wireless headsets, smart tablets, and displays',
        icon: 'Smartphone',
      },
      {
        code: 'ERGO',
        name: 'Office Ergonomics',
        description: 'Adjustable motorized standing desks and ergonomic seating',
        icon: 'Armchair',
      },
      {
        code: 'NETW',
        name: 'Networking & Peripherals',
        description: 'Wi-Fi 7 access points, enterprise switches, and webcams',
        icon: 'Wifi',
      },
      {
        code: 'STOR',
        name: 'High-Speed Storage',
        description: 'NVMe solid state arrays and backup NAS drives',
        icon: 'HardDrive',
      },
    ]);

    const compCat = categories.find((c) => c.code === 'COMP')!;
    const elecCat = categories.find((c) => c.code === 'ELEC')!;
    const ergoCat = categories.find((c) => c.code === 'ERGO')!;
    const netwCat = categories.find((c) => c.code === 'NETW')!;
    const storCat = categories.find((c) => c.code === 'STOR')!;

    // 3. Seed Products
    logger.info('Seeding products...');
    const products = await Product.create([
      {
        sku: 'COMP-X1-PRO',
        name: 'Apex ThinkPro 16" Laptop',
        categoryId: compCat._id,
        description: 'Core Ultra 7, 32GB RAM, 1TB SSD enterprise workstation',
        unitCost: 950.0,
        unitPrice: 1499.0,
        currentStock: 42,
        reorderThreshold: 15,
        leadTimeDays: 10,
        status: 'ACTIVE',
      },
      {
        sku: 'COMP-DOCK-8K',
        name: 'Universal Thunderbolt 4 Dock',
        categoryId: compCat._id,
        description: 'Dual 8K output, 100W PD charging workstation hub',
        unitCost: 110.0,
        unitPrice: 229.0,
        currentStock: 18,
        reorderThreshold: 20, // Low stock trigger
        leadTimeDays: 7,
        status: 'ACTIVE',
      },
      {
        sku: 'ELEC-ANC-700',
        name: 'AcousticShield Pro Wireless ANC Headset',
        categoryId: elecCat._id,
        description: 'Active noise cancelling wireless headset for conferencing',
        unitCost: 85.0,
        unitPrice: 189.0,
        currentStock: 85,
        reorderThreshold: 25,
        leadTimeDays: 5,
        status: 'ACTIVE',
      },
      {
        sku: 'ELEC-DISP-4K',
        name: 'UltraSharp 32" Curved 4K Monitor',
        categoryId: elecCat._id,
        description: '100% sRGB color-accurate HDR professional display',
        unitCost: 320.0,
        unitPrice: 599.0,
        currentStock: 9, // Low stock trigger
        reorderThreshold: 12,
        leadTimeDays: 14,
        status: 'ACTIVE',
      },
      {
        sku: 'ERGO-DESK-PRO',
        name: 'Vertex Dual-Motor Standing Desk',
        categoryId: ergoCat._id,
        description: 'Solid walnut 60x30 inch height-adjustable executive desk',
        unitCost: 280.0,
        unitPrice: 549.0,
        currentStock: 24,
        reorderThreshold: 10,
        leadTimeDays: 12,
        status: 'ACTIVE',
      },
      {
        sku: 'ERGO-CHAIR-M1',
        name: 'AeroPosture Ergonomic Mesh Chair',
        categoryId: ergoCat._id,
        description: 'Dynamic lumbar support with 4D adjustable armrests',
        unitCost: 190.0,
        unitPrice: 389.0,
        currentStock: 35,
        reorderThreshold: 15,
        leadTimeDays: 10,
        status: 'ACTIVE',
      },
      {
        sku: 'NETW-WIFI7-AP',
        name: 'OmniMesh Wi-Fi 7 Business AP',
        categoryId: netwCat._id,
        description: 'Tri-band 2.5G PoE enterprise wireless access point',
        unitCost: 140.0,
        unitPrice: 279.0,
        currentStock: 50,
        reorderThreshold: 15,
        leadTimeDays: 6,
        status: 'ACTIVE',
      },
      {
        sku: 'NETW-CAM-4K',
        name: 'VisionAI 4K Ultra Wide Conference Cam',
        categoryId: netwCat._id,
        description: 'AI speaker tracking and auto-framing boardroom camera',
        unitCost: 160.0,
        unitPrice: 320.0,
        currentStock: 4, // Critical low stock trigger
        reorderThreshold: 10,
        leadTimeDays: 8,
        status: 'ACTIVE',
      },
      {
        sku: 'STOR-NVME-2TB',
        name: 'SpeedPro Enterprise 2TB NVMe M.2',
        categoryId: storCat._id,
        description: 'PCIe 5.0 12,000 MB/s sustained high-throughput SSD',
        unitCost: 90.0,
        unitPrice: 175.0,
        currentStock: 65,
        reorderThreshold: 20,
        leadTimeDays: 5,
        status: 'ACTIVE',
      },
      {
        sku: 'STOR-NAS-4BAY',
        name: 'CloudSync 4-Bay Rackmount NAS',
        categoryId: storCat._id,
        description: 'Quad-core redundant hot-swap business backup appliance',
        unitCost: 450.0,
        unitPrice: 799.0,
        currentStock: 12,
        reorderThreshold: 8,
        leadTimeDays: 15,
        status: 'ACTIVE',
      },
    ]);

    // 4. Seed Suppliers
    logger.info('Seeding suppliers...');
    const suppliers = await Supplier.create([
      {
        code: 'SUPP-APEX',
        name: 'Apex Semiconductor & Logistics',
        contactPerson: 'David Miller',
        email: 'orders@apexsemi.com',
        phone: '+1 (555) 234-5678',
        address: '100 Silicon Way',
        city: 'San Jose, CA',
        country: 'United States',
        leadTimeDays: 7,
        rating: 4.8,
        status: 'ACTIVE',
        totalOrdersPlaced: 24,
        onTimeDeliveryRate: 95.8,
      },
      {
        code: 'SUPP-NEXUS',
        name: 'Nexus Microelectronics Ltd',
        contactPerson: 'Kavita Patel',
        email: 'supply@nexusmicro.com',
        phone: '+1 (555) 876-5432',
        address: '450 Innovation Parkway',
        city: 'Austin, TX',
        country: 'United States',
        leadTimeDays: 10,
        rating: 4.4,
        status: 'ACTIVE',
        totalOrdersPlaced: 18,
        onTimeDeliveryRate: 88.9,
      },
      {
        code: 'SUPP-HORIZON',
        name: 'Horizon Ergonomics Works',
        contactPerson: 'Thomas Becker',
        email: 'b2b@horizonergo.com',
        phone: '+1 (555) 345-6789',
        address: '782 Industrial Blvd',
        city: 'Grand Rapids, MI',
        country: 'United States',
        leadTimeDays: 12,
        rating: 4.7,
        status: 'ACTIVE',
        totalOrdersPlaced: 15,
        onTimeDeliveryRate: 93.3,
      },
      {
        code: 'SUPP-PACIFIC',
        name: 'Pacific Hardware Components',
        contactPerson: 'Mei-Ling Zhou',
        email: 'procurement@pacifichw.com',
        phone: '+1 (555) 987-6543',
        address: '22 Oceanview Pier',
        city: 'Seattle, WA',
        country: 'United States',
        leadTimeDays: 14,
        rating: 3.8, // Poor delivery SLA supplier to trigger insight
        status: 'ACTIVE',
        totalOrdersPlaced: 12,
        onTimeDeliveryRate: 75.0,
      },
    ]);

    // 5. Seed Purchase Orders
    logger.info('Seeding purchase orders...');
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 3600 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
    const fiveDaysFuture = new Date(now.getTime() + 5 * 24 * 3600 * 1000);
    const twoDaysPast = new Date(now.getTime() - 2 * 24 * 3600 * 1000);

    const laptopProduct = products[0];
    const dockProduct = products[1];
    const camProduct = products[7];
    const ssdProduct = products[8];

    await PurchaseOrder.create([
      {
        poNumber: 'PO-2026-01001',
        supplierId: suppliers[0]._id,
        status: 'RECEIVED',
        orderDate: tenDaysAgo,
        expectedDeliveryDate: threeDaysAgo,
        actualDeliveryDate: threeDaysAgo,
        items: [
          {
            productId: laptopProduct._id,
            sku: laptopProduct.sku,
            productName: laptopProduct.name,
            orderedQuantity: 20,
            receivedQuantity: 20,
            unitCost: laptopProduct.unitCost,
            totalCost: 20 * laptopProduct.unitCost,
          },
        ],
        totalAmount: 20 * laptopProduct.unitCost,
        notes: 'Annual workstation refresh order',
        createdBy: managerUser._id,
        approvedBy: adminUser._id,
        receivedBy: managerUser._id,
      },
      {
        poNumber: 'PO-2026-01002',
        supplierId: suppliers[1]._id,
        status: 'APPROVED',
        orderDate: fiveDaysFuture,
        expectedDeliveryDate: twoDaysPast, // Overdue delivery to trigger delayed PO alert
        items: [
          {
            productId: dockProduct._id,
            sku: dockProduct.sku,
            productName: dockProduct.name,
            orderedQuantity: 30,
            receivedQuantity: 0,
            unitCost: dockProduct.unitCost,
            totalCost: 30 * dockProduct.unitCost,
          },
        ],
        totalAmount: 30 * dockProduct.unitCost,
        notes: 'Urgent dock replenishment',
        createdBy: managerUser._id,
        approvedBy: adminUser._id,
      },
      {
        poNumber: 'PO-2026-01003',
        supplierId: suppliers[3]._id,
        status: 'PARTIALLY_RECEIVED',
        orderDate: tenDaysAgo,
        expectedDeliveryDate: fiveDaysFuture,
        items: [
          {
            productId: camProduct._id,
            sku: camProduct.sku,
            productName: camProduct.name,
            orderedQuantity: 25,
            receivedQuantity: 10,
            unitCost: camProduct.unitCost,
            totalCost: 25 * camProduct.unitCost,
          },
        ],
        totalAmount: 25 * camProduct.unitCost,
        notes: 'Camera shipment partial arrival from Pacific HW',
        createdBy: managerUser._id,
        approvedBy: adminUser._id,
        receivedBy: managerUser._id,
      },
      {
        poNumber: 'PO-2026-01004',
        supplierId: suppliers[0]._id,
        status: 'SUBMITTED',
        orderDate: now,
        expectedDeliveryDate: fiveDaysFuture,
        items: [
          {
            productId: ssdProduct._id,
            sku: ssdProduct.sku,
            productName: ssdProduct.name,
            orderedQuantity: 40,
            receivedQuantity: 0,
            unitCost: ssdProduct.unitCost,
            totalCost: 40 * ssdProduct.unitCost,
          },
        ],
        totalAmount: 40 * ssdProduct.unitCost,
        notes: 'Routine quarterly buffer stock',
        createdBy: managerUser._id,
      },
    ]);

    // 6. Seed Customer Sales Orders (Spanning multiple months & regions)
    logger.info('Seeding customer sales orders across regions...');
    const customerOrdersData = [
      {
        name: 'Quantum Financial Group',
        email: 'procurement@quantumfin.com',
        region: 'North' as const,
        daysAgo: 140,
        items: [{ prod: products[0], qty: 5 }, { prod: products[1], qty: 5 }],
      },
      {
        name: 'Apex Health Systems',
        email: 'tech@apexhealth.org',
        region: 'West' as const,
        daysAgo: 115,
        items: [{ prod: products[4], qty: 4 }, { prod: products[5], qty: 4 }],
      },
      {
        name: 'Metropolitan Bank Corp',
        email: 'itorders@metrobank.com',
        region: 'East' as const,
        daysAgo: 90,
        items: [{ prod: products[0], qty: 8 }, { prod: products[3], qty: 8 }],
      },
      {
        name: 'Vanguard Aerospace LLC',
        email: 'hardware@vanguardaero.com',
        region: 'Central' as const,
        daysAgo: 70,
        items: [{ prod: products[6], qty: 10 }, { prod: products[8], qty: 15 }],
      },
      {
        name: 'Starlight Media Studios',
        email: 'post@starlightmedia.io',
        region: 'West' as const,
        daysAgo: 50,
        items: [{ prod: products[3], qty: 6 }, { prod: products[9], qty: 2 }],
      },
      {
        name: 'Crestview University',
        email: 'labadmin@crestview.edu',
        region: 'South' as const,
        daysAgo: 35,
        items: [{ prod: products[2], qty: 25 }, { prod: products[1], qty: 12 }],
      },
      {
        name: 'Zenith Logistics Global',
        email: 'admin@zenithlog.com',
        region: 'North' as const,
        daysAgo: 20,
        items: [{ prod: products[0], qty: 6 }, { prod: products[4], qty: 6 }],
      },
      {
        name: 'Pinnacle Consulting Partners',
        email: 'operations@pinnacle.com',
        region: 'East' as const,
        daysAgo: 12,
        items: [{ prod: products[0], qty: 4 }, { prod: products[2], qty: 8 }],
      },
      {
        name: 'Silverline Insurance Group',
        email: 'procure@silverlineins.com',
        region: 'Central' as const,
        daysAgo: 5,
        items: [{ prod: products[5], qty: 8 }, { prod: products[6], qty: 4 }],
      },
      {
        name: 'NovaTech Bio Labs',
        email: 'ops@novatechbio.com',
        region: 'South' as const,
        daysAgo: 1,
        items: [{ prod: products[0], qty: 3 }, { prod: products[8], qty: 10 }],
      },
    ];

    let orderSeq = 10001;
    for (const ord of customerOrdersData) {
      const orderDate = new Date(now.getTime() - ord.daysAgo * 24 * 3600 * 1000);
      let subtotal = 0;
      let totalCogs = 0;
      const orderItems = [];

      for (const item of ord.items) {
        const itemTotal = Number((item.prod.unitPrice * item.qty).toFixed(2));
        const itemCogs = Number((item.prod.unitCost * item.qty).toFixed(2));
        const itemProfit = Number((itemTotal - itemCogs).toFixed(2));

        subtotal += itemTotal;
        totalCogs += itemCogs;

        orderItems.push({
          productId: item.prod._id,
          sku: item.prod.sku,
          productName: item.prod.name,
          quantity: item.qty,
          unitPrice: item.prod.unitPrice,
          unitCost: item.prod.unitCost,
          totalPrice: itemTotal,
          grossProfit: itemProfit,
        });
      }

      const discount = ord.daysAgo > 60 ? 100 : 0;
      const tax = Number((Math.max(0, subtotal - discount) * 0.08).toFixed(2));
      const totalAmount = Number((subtotal - discount + tax).toFixed(2));
      const grossProfit = Number((subtotal - discount - totalCogs).toFixed(2));

      await CustomerOrder.create({
        orderNumber: `ORD-2026-${orderSeq++}`,
        customerName: ord.name,
        customerEmail: ord.email,
        region: ord.region,
        orderDate,
        status: ord.daysAgo > 3 ? 'DELIVERED' : 'CONFIRMED',
        items: orderItems,
        subtotal: Number(subtotal.toFixed(2)),
        discount,
        tax,
        totalAmount,
        grossProfit,
        paymentStatus: 'PAID',
        fulfilledDate: ord.daysAgo > 3 ? new Date(orderDate.getTime() + 2 * 24 * 3600 * 1000) : undefined,
      });
    }

    // 7. Seed Initial Inventory Movements
    logger.info('Seeding stock movement audit logs...');
    for (const p of products) {
      await InventoryMovement.create({
        productId: p._id,
        movementType: 'RECEIPT',
        quantity: p.currentStock + 10,
        previousStock: 0,
        newStock: p.currentStock + 10,
        reason: 'Initial stock intake from factory distributor',
        referenceType: 'INITIAL_STOCK',
        referenceId: `STOCK-INIT-${p.sku}`,
        performedByName: 'Eleanor Vance',
      });
    }

    // 8. Seed Business Requirements (MCA placement portfolio highlight)
    logger.info('Seeding business requirements and functional documentation...');
    await Requirement.create([
      {
        requirementId: 'INV-001',
        title: 'Real-Time Low-Stock Detection & Automated Reorder Alerting',
        description:
          'The application must continually evaluate available warehouse inventory against user-configured reorder thresholds and surface prioritized alerts to procurement analysts.',
        businessObjective:
          'Eliminate stockout conditions, reduce sales downtime by 35%, and maintain target customer service levels.',
        stakeholder: 'Warehouse & Fulfillment Operations Director',
        priority: 'CRITICAL',
        type: 'FUNCTIONAL',
        status: 'IMPLEMENTED',
        relatedModule: 'Inventory',
        acceptanceCriteria: [
          {
            id: 'AC-INV-01',
            text: 'System compares currentStock <= reorderThreshold in real time across active SKUs.',
            isMet: true,
          },
          {
            id: 'AC-INV-02',
            text: 'Products breaching thresholds are highlighted with amber warning or red critical indicators.',
            isMet: true,
          },
          {
            id: 'AC-INV-03',
            text: 'Authorized managers can trigger instant stock adjustment or launch linked PO replenishment.',
            isMet: true,
          },
        ],
        createdByName: 'Sophia Chen',
        updatedByName: 'Sophia Chen',
      },
      {
        requirementId: 'PUR-002',
        title: 'Two-Tier Purchase Order Workflow and Stock Receipt Reconciliation',
        description:
          'Implement a rigorous state machine for purchase orders (DRAFT -> SUBMITTED -> APPROVED -> RECEIVED) preventing premature stock intake without dual management authorization.',
        businessObjective:
          'Enforce strict financial segregation of duties, reduce rogue ordering, and maintain accurate inventory valuations.',
        stakeholder: 'VP of Procurement & Finance',
        priority: 'HIGH',
        type: 'BUSINESS',
        status: 'IMPLEMENTED',
        relatedModule: 'Purchasing',
        acceptanceCriteria: [
          {
            id: 'AC-PUR-01',
            text: 'Draft orders can only transition to SUBMITTED by analyst or warehouse manager.',
            isMet: true,
          },
          {
            id: 'AC-PUR-02',
            text: 'Approval requires ADMIN or designated MANAGER role before any stock receipt can be executed.',
            isMet: true,
          },
          {
            id: 'AC-PUR-03',
            text: 'Stock receipt must update inventory transactionally and generate immutable movement audit records.',
            isMet: true,
          },
        ],
        createdByName: 'Sophia Chen',
        updatedByName: 'Eleanor Vance',
      },
      {
        requirementId: 'SAL-003',
        title: 'Multi-Regional Sales & Gross Margin Real-Time Analytics',
        description:
          'Provide executive and functional analysts with granular sales tables, regional performance comparisons, and accurate gross profit / margin calculations excluding cancelled orders.',
        businessObjective:
          'Empower product managers to identify high-margin product lines and strategically optimize regional stock allocations.',
        stakeholder: 'Chief Commercial Officer',
        priority: 'HIGH',
        type: 'FUNCTIONAL',
        status: 'IMPLEMENTED',
        relatedModule: 'Sales',
        acceptanceCriteria: [
          {
            id: 'AC-SAL-01',
            text: 'Gross Profit must equal Net Sales Revenue minus Cost of Goods Sold (COGS).',
            isMet: true,
          },
          {
            id: 'AC-SAL-02',
            text: 'Gross Margin Percentage must safely handle zero or negative revenue without division-by-zero crashes.',
            isMet: true,
          },
          {
            id: 'AC-SAL-03',
            text: 'Server-side filtering by region, date range, and order status must apply consistently to both UI and CSV exports.',
            isMet: true,
          },
        ],
        createdByName: 'Sophia Chen',
        updatedByName: 'Sophia Chen',
      },
      {
        requirementId: 'SEC-004',
        title: 'Role-Based Access Control and Immutable Operational Audit Trail',
        description:
          'Enforce server-side authorization separating ADMIN, MANAGER, and ANALYST roles with audit logging of sensitive business state mutations.',
        businessObjective:
          'Guarantee corporate governance compliance, prevent unauthorized data manipulation, and ensure traceability of all warehouse stock changes.',
        stakeholder: 'Head of Internal Audit & Security',
        priority: 'CRITICAL',
        type: 'NON_FUNCTIONAL',
        status: 'IMPLEMENTED',
        relatedModule: 'Security',
        acceptanceCriteria: [
          {
            id: 'AC-SEC-01',
            text: 'Server returns HTTP 403 Forbidden when an unauthorized role attempts protected state mutations.',
            isMet: true,
          },
          {
            id: 'AC-SEC-02',
            text: 'Password hashes must utilize salted bcrypt encryption with no plaintext credentials logged.',
            isMet: true,
          },
          {
            id: 'AC-SEC-03',
            text: 'Every stock adjustment, PO approval, and product creation records user, timestamp, and IP address in AuditEvent.',
            isMet: true,
          },
        ],
        createdByName: 'Sophia Chen',
        updatedByName: 'Eleanor Vance',
      },
    ]);

    // 9. Seed Business Insights & Operational Alerts
    logger.info('Seeding operational business insights...');
    await BusinessInsight.create([
      {
        insightKey: 'RULE_LOW_STOCK_ALERT',
        title: '3 Product(s) Below Reorder Threshold',
        category: 'INVENTORY',
        severity: 'CRITICAL',
        evidence: 'VisionAI 4K Cam (4/10 units), UltraSharp Monitor (9/12 units), TB4 Dock (18/20 units)',
        relevantMetric: 'Low-Stock Products',
        metricValue: 3,
        period: 'Real-time',
        explanation:
          'Current stock quantities have fallen below minimum safety stock buffers, presenting urgent delivery disruption risk.',
        recommendedAction:
          'Generate expedited purchase orders for affected SKUs to prevent immediate order backlogging.',
        status: 'ACTIVE',
      },
      {
        insightKey: 'RULE_OVERDUE_PURCHASE_ORDERS',
        title: '1 Purchase Order Overdue Delivery SLA',
        category: 'SUPPLIERS',
        severity: 'CRITICAL',
        evidence: 'PO-2026-01002 from Nexus Microelectronics was due 2 days ago',
        relevantMetric: 'Overdue PO Count',
        metricValue: 1,
        period: 'Pending POs',
        explanation:
          'Supplier Nexus Microelectronics has breached contractual delivery SLA for Thunderbolt dock replenishment.',
        recommendedAction:
          'Contact supplier dispatch manager to escalate delivery tracking and acquire updated ETA.',
        status: 'ACTIVE',
      },
      {
        insightKey: 'RULE_POOR_SUPPLIER_RELIABILITY',
        title: 'Supplier Pacific Hardware Below 80% SLA Threshold',
        category: 'SUPPLIERS',
        severity: 'WARNING',
        evidence: 'Pacific Hardware Components has recorded an on-time delivery rate of 75.0%',
        relevantMetric: 'Supplier SLA Compliance',
        metricValue: 75.0,
        period: 'Trailing 12 orders',
        explanation:
          'Repeated logistics delays from this vendor introduce volatility into regional warehouse lead times.',
        recommendedAction:
          'Reallocate upcoming procurement volume to secondary qualified supplier Apex Semiconductor.',
        status: 'ACTIVE',
      },
    ]);

    logger.info('Deterministic database seeding completed successfully!');
    logger.info('Demo Credentials:');
    logger.info('  Admin:   admin@bizflow360.com   / Admin@12345');
    logger.info('  Manager: manager@bizflow360.com / Manager@12345');
    logger.info('  Analyst: analyst@bizflow360.com / Analyst@12345');

    if (shouldConnect) {
      await mongoose.disconnect();
    }
  } catch (err: any) {
    logger.error('Error during database seed execution', { error: err.message, stack: err.stack });
    if (shouldConnect) {
      process.exit(1);
    }
    throw err;
  }
}

// Allow direct execution
if (process.argv[1]?.includes('seedData')) {
  seedDatabase();
}
