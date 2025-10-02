#!/usr/bin/env node

/**
 * Script para probar la funcionalidad del menú hamburguesa en diferentes tamaños de pantalla
 * Ejecutar: node test-responsive-header.js
 */

const puppeteer = require('puppeteer');

async function testHeaderResponsiveness() {
  console.log('🧪 Iniciando pruebas de responsividad del Header...\n');

  const browser = await puppeteer.launch({ 
    headless: false, // Para ver las pruebas en acción
    defaultViewport: null 
  });
  
  const page = await browser.newPage();
  
  // Cargar la aplicación (ajustar URL según sea necesario)
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  const viewports = [
    { name: 'Móvil pequeño', width: 375, height: 667 },
    { name: 'Móvil grande', width: 414, height: 896 },
    { name: 'Tablet vertical', width: 768, height: 1024 },
    { name: 'Tablet horizontal', width: 1024, height: 768 },
    { name: 'Desktop pequeño', width: 1200, height: 800 },
    { name: 'Desktop grande', width: 1440, height: 900 }
  ];

  for (const viewport of viewports) {
    console.log(`📱 Probando: ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    await page.setViewport({
      width: viewport.width,
      height: viewport.height
    });

    // Esperar un momento para que se apliquen los estilos
    await page.waitForTimeout(500);

    // Verificar si el menú hamburguesa está visible
    const hamburgerVisible = await page.evaluate(() => {
      const burger = document.querySelector('button[aria-label="القائمة"]');
      if (!burger) return false;
      const style = window.getComputedStyle(burger);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    // Verificar si la navegación principal está visible  
    const navVisible = await page.evaluate(() => {
      const nav = document.querySelector('nav.xl\\:flex');
      if (!nav) return false;
      const style = window.getComputedStyle(nav);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    // Probar funcionalidad del menú hamburguesa si está visible
    let drawerWorks = false;
    if (hamburgerVisible) {
      try {
        // Hacer clic en el menú hamburguesa
        await page.click('button[aria-label="القائمة"]');
        await page.waitForTimeout(300);
        
        // Verificar si el drawer se abrió
        drawerWorks = await page.evaluate(() => {
          const drawer = document.querySelector('.xl\\:hidden [aria-hidden="false"]');
          return drawer !== null;
        });

        // Cerrar el drawer
        if (drawerWorks) {
          await page.click('button[aria-label="إغلاق القائمة"]');
          await page.waitForTimeout(300);
        }
      } catch (error) {
        console.log(`   ❌ Error al probar drawer: ${error.message}`);
      }
    }

    // Resultados
    const status = viewport.width >= 1280 ? 'Desktop' : 'Mobile/Tablet';
    const expected = viewport.width >= 1280 ? 'Nav visible' : 'Hamburger visible';
    
    console.log(`   ${status} mode:`);
    console.log(`   - Menú hamburguesa: ${hamburgerVisible ? '✅ Visible' : '❌ Oculto'}`);
    console.log(`   - Navegación principal: ${navVisible ? '✅ Visible' : '❌ Oculta'}`);
    console.log(`   - Drawer funcional: ${drawerWorks ? '✅ Sí' : (hamburgerVisible ? '❌ No' : 'N/A')}`);
    console.log(`   - Expectativa: ${expected} ${viewport.width >= 1280 ? (navVisible ? '✅' : '❌') : (hamburgerVisible ? '✅' : '❌')}`);
    console.log('');
  }

  await browser.close();
  console.log('🎉 Pruebas completadas!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testHeaderResponsiveness().catch(console.error);
}

module.exports = { testHeaderResponsiveness };