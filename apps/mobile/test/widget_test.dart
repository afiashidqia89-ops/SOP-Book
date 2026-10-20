import 'package:flutter_test/flutter_test.dart';
import 'package:sop_mobile/src/app.dart';
void main(){testWidgets('menampilkan judul aplikasi',(tester)async{await tester.pumpWidget(const SopApp());expect(find.text('SOP Mobile'),findsOneWidget);});}
