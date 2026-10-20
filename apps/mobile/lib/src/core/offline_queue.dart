class OfflineEvent { final String type; final Map<String,dynamic> payload; final DateTime createdAt; OfflineEvent(this.type,this.payload):createdAt=DateTime.now(); Map<String,dynamic> toJson()=>{'type':type,'payload':payload,'createdAt':createdAt.toIso8601String()}; }
// Ganti implementasi memori ini dengan tabel Drift sebelum produksi.
class OfflineQueue { final List<OfflineEvent> _pending=[]; void add(OfflineEvent event)=>_pending.add(event); List<OfflineEvent> get pending=>List.unmodifiable(_pending); void clear()=>_pending.clear(); }
