import 'package:flutter/material.dart';
import 'features/home/home_page.dart';
class SopApp extends StatelessWidget { const SopApp({super.key}); @override Widget build(BuildContext context){return MaterialApp(debugShowCheckedModeBanner:false,title:'SOP Mobile',theme:ThemeData(colorScheme:ColorScheme.fromSeed(seedColor:const Color(0xFF147A4A)),useMaterial3:true),home:const HomePage());}}
